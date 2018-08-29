const Router = require('koa-router');
const randomstring = require('randomstring');
const {application, phoneNumber, endpoint} = require('@bandwidth/node-bandwidth-extra');
const Client = require('node-bandwidth');
const Redis = require('ioredis');
const debug = require('debug')('routes');

const router = new Router();
const appName = 'React Native Phone';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function getEndpoint(api, domainId, sipName) {
    try {
        const ep = await endpoint.getEndpoint(api, domainId, sipName);
        return ep;
    } catch(err) {
        return null;
    }
}

router.post('/login', async ctx => {
    let {userId, domainId, apiToken, apiSecret, password} = ctx.request.body;
    let number = ctx.request.body.phoneNumber;
    const api = new Client({userId, apiToken, apiSecret});
    const callbackUrl = `${ctx.request.origin}/${userId}/callback`;
    debug('Getting application data');
    const applicationId = await application.getOrCreateApplication(api, {
        name: appName,
        incomingCallUrl: callbackUrl,
        incomingMessageUrl: callbackUrl
    }, ctx.request.hostname);
    const name = `${appName} on ${ctx.request.hostname}`;
    debug('Getting phone number');
    if (number) {
        const numbers = await phoneNumber.listPhoneNumbers(api, applicationId);
        const existingNumber = numbers.filter(n => n.number === number)[0];
        if (existingNumber) {
            await api.PhoneNumber.update(existingNumber.id, {applicationId, name});
        }
    } else {
        number = await phoneNumber.getOrCreatePhoneNumber(api, applicationId, {name, areaCode: process.env.AREA_CODE || '910'});
    }
    debug('Getting SIP domain data');
    if (!domainId) {
        domainId = await endpoint.getOrCreateDomain(api, `d${randomstring.generate({
            length: 14,
            charset: 'alphanumeric',
            capitalization: 'lowercase'
        })}`);
    }
    debug('Getting endpoint data');
    const sipName = `num-${number.substr(1)}`;
    let {id, sipUri} = (await getEndpoint(api, domainId, sipName)) || {};
    if (id) {
        await api.Endpoint.update(domainId, id, {credentials: {password}});
    } else {
        let ep = await api.Endpoint.create(domainId, {
            name: sipName,
            domainId,
            applicationId,
            enabled: true,
            credentials: {password}
        });
        ep = await api.Endpoint.get(domainId, ep.id);
        sipUri = ep.sipUri;
    }
    debug('Saving user data');
    await redis.set(userId, JSON.stringify({apiToken, apiSecret, sipUri, phoneNumber: number}));
    ctx.body = {sipUri, phoneNumber: number};
});

router.post('/:userId/callback', async ctx => {
    const {eventType, from, to, callId} = ctx.request.body;
    ctx.body = ' ';
    const userData = JSON.parse((await redis.get(ctx.params.userId)) || '{}');
    if (!userData.apiToken || !userData.apiSecret || eventType !== 'answer') {
        debug('No user data for %s (event type %s)', ctx.params.userId, eventType);
        return;
    }
    const api = new Client({userId: ctx.params.userId, apiToken: userData.apiToken, apiSecret: userData.apiSecret});
    if (from === userData.sipUri) {
        // outgoing calls
        debug('Outgoing call %s -> %s', userData.phoneNumber, to);
        await api.Call.transfer(callId, {
            transferCallerId: userData.phoneNumber,
            transferTo: to,
        });
    }
    if (to === userData.phoneNumber) {
        // incoming calls
        debug('Incoming call %s -> %s', from, userData.phoneNumber);
        await api.Call.transfer(callId, {
            transferTo: userData.sipUri
        });
    }
});

module.exports = router;