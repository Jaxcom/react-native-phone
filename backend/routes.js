const Router = require('koa-router');
const randomstring = require('randomstring');
const {application, phoneNumber, endpoint} = require('@bandwidth/node-bandwidth-extra');
const Redis = require('ioredis');
const Expo = require('expo-server-sdk');
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
    let {userId, domainId, apiToken, apiSecret} = ctx.request.body;
    let number = ctx.request.body.phoneNumber;
    const api = router.getBandwidthApi({userId, apiToken, apiSecret});
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
    const password = randomstring.generate(24);
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
    ctx.body = {sipUri, phoneNumber: number, password};
});

router.post('/:userId/callback', async ctx => {
    const {eventType, from, to, callId, messageId} = ctx.request.body;
    ctx.body = ' ';
    const userData = JSON.parse((await redis.get(ctx.params.userId)) || '{}');
    if (!userData.apiToken || !userData.apiSecret) {
        debug('No user data for %s (event type %s)', ctx.params.userId, eventType);
        return;
    }
    const api = router.getBandwidthApi({userId: ctx.params.userId, apiToken: userData.apiToken, apiSecret: userData.apiSecret});
    if (eventType === 'answer') {
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
                transferCallerId: from,
                transferTo: userData.sipUri
            });
        }
    }
    if (eventType === 'sms') {
        if (to === userData.phoneNumber) {
            debug('Incoming message %s -> %s', from, userData.phoneNumber);
            
            const message = await api.Message.get(messageId);
            // send notification to active clients
            await redis.publish(userData.phoneNumber, JSON.stringify(message));
            
            // send push notification
            const expo = new Expo();
            if (!Expo.isExpoPushToken(userData.token)) {
                return;
            }
            const chunk = expo.chunkPushNotifications([{
                to: userData.token,
                sound: 'default',
                body: message.text,
                data: JSON.stringify(message),
            }])[0];
            await expo.sendPushNotificationsAsync(chunk);
        }
    }
});

router.post('/loadMessages', async ctx => {
    const getAllMessages = async promise => {
        let result = await promise;
        let {messages} = result;
        while (result.hasNextPage) {
            result = await result.getNextPage();
            messages = messages.concat(result.messages);
        }
        return messages;    
    };
    
    const {phoneNumber} = ctx.request.body;
    const api = router.getBandwidthApi(ctx.request.body);
    const messagesTo = await getAllMessages(api.Message.list({size: 1000, to: phoneNumber}));
    const messagesFrom = await getAllMessages(api.Message.list({size: 1000, from: phoneNumber}));
    const messages = [].concat(messagesTo, messagesFrom);
    messages.sort((m1, m2) => m1.time.localeCompare(m2.time));
    ctx.body = messages;
});

router.post('/sendMessage', async ctx => {
    const {to, text, phoneNumber} = ctx.request.body;
    const api = router.getBandwidthApi(ctx.request.body);
    const id = (await api.Message.send({
        from: phoneNumber,
        to,
        text
    })).id;
    const message = await api.Message.get(id);
    ctx.body = message;
});

router.post('/registerForPush', async ctx => {
    ctx.body = {};
    const {token, userId} = ctx.request.body;
    const userData = JSON.parse((await redis.get(userId)) || '{}');
    debug('Saving push notification token %s for user %s', token, userId);
    userData.token = token;
    await redis.set(userId, JSON.stringify(userData));
});

module.exports = router;