const test = require('ava');
const Router = require('koa-router');
const td = require('testdouble');
const randomstring = require('randomstring');
const Redis = require('ioredis');
const {application, phoneNumber, endpoint} = require('@bandwidth/node-bandwidth-extra');

td.replace(application, 'getOrCreateApplication');
td.replace(phoneNumber, 'listPhoneNumbers');
td.replace(phoneNumber, 'getOrCreatePhoneNumber');
td.replace(endpoint, 'getOrCreateDomain');
td.replace(endpoint, 'getEndpoint');
randomstring.generate = () => 'random';

const router = require('../routes');
const routes = router.routes();


td.replace(Redis.prototype, 'sendCommand');
Redis.prototype.connect = () => Promise.resolve();

test('it should return router instance', async t => {
    t.true(router instanceof Router);
});


test.serial('POST /login should configure bandwidth app, reserve a number and sip enpoint', async t => {
    const ctx = {
        path: '/login',
        method: 'POST',
        request: {
            body: {
                userId: 'userId',
                apiToken: 'apiToken',
                apiSecret: 'apiSecret'
            },
            hostname: 'localhost',
            origin: 'http://localhost'
        }
    };
    td.when(application.getOrCreateApplication(td.matchers.anything(), {
        incomingCallUrl: 'http://localhost/userId/callback',
        incomingMessageUrl: 'http://localhost/userId/callback',
        name: 'React Native Phone',
    }, 'localhost')).thenResolve('applicationId');
    td.when(phoneNumber.getOrCreatePhoneNumber(td.matchers.anything(), 'applicationId', {
        name: 'React Native Phone on localhost', 
        areaCode: '910'
    })).thenResolve('+11234567890');
    td.when(endpoint.getOrCreateDomain(td.matchers.anything(), `drandom`)).thenResolve('domainId');
    td.when(endpoint.getEndpoint(td.matchers.anything(), 'domainId', 'num-11234567890')).thenResolve({
        id: 'id',
        sipUri: 'num-11234567890@test.com'
    });
    const mockApi = {
        Endpoint: {
            update: td.function()
        }
    };
    router.getBandwidthApi = () => mockApi;
    td.when(mockApi.Endpoint.update('domainId', 'id', {credentials: {password: 'random'}})).thenResolve();
    await routes(ctx, null);
    t.is(ctx.body.sipUri, 'num-11234567890@test.com');
    t.is(ctx.body.phoneNumber, '+11234567890');
    t.is(ctx.body.password, 'random');
});

test.serial('POST /login should reuse existing number and domain', async t => {
    const ctx = {
        path: '/login',
        method: 'POST',
        request: {
            body: {
                userId: 'userId2',
                apiToken: 'apiToken',
                apiSecret: 'apiSecret',
                domainId: 'domainId',
                phoneNumber: '+11234567891'
            },
            hostname: 'localhost',
            origin: 'http://localhost'
        }
    };
    td.when(application.getOrCreateApplication(td.matchers.anything(), {
        incomingCallUrl: 'http://localhost/userId2/callback',
        incomingMessageUrl: 'http://localhost/userId2/callback',
        name: 'React Native Phone',
    }, 'localhost')).thenResolve('applicationId2');
    td.when(phoneNumber.listPhoneNumbers(td.matchers.anything(), 'applicationId2')).thenResolve([{number: '+11234567891', id: 'id1'}]);
    td.when(endpoint.getEndpoint(td.matchers.anything(), 'domainId', 'num-11234567891')).thenResolve(null);
    const mockApi = {
        PhoneNumber: {
            update: td.function()
        },
        Endpoint: {
            create: td.function(),
            get: td.function()
        }
    };
    router.getBandwidthApi = () => mockApi;
    td.when(mockApi.PhoneNumber.update('id1', {applicationId: 'applicationId2', name: 'React Native Phone on localhost'})).thenResolve();
    td.when(mockApi.Endpoint.create('domainId', {
        name: 'num-11234567891',
        domainId: 'domainId',
        applicationId: 'applicationId2',
        enabled: true,
        credentials: {password: 'random'}
    })).thenResolve({id: 'eid'});
    td.when(mockApi.Endpoint.get('domainId', 'eid')).thenResolve({id: 'eid', sipUri: 'num-11234567891@test.com'});
    await routes(ctx, null);
    t.is(ctx.body.sipUri, 'num-11234567891@test.com');
    t.is(ctx.body.phoneNumber, '+11234567891');
    t.is(ctx.body.password, 'random');
});

test.serial('POST /userId/callback should handle outgoing calls', async t => {
    const ctx = {
        path: '/userId/callback',
        method: 'POST',
        request: {
            body: {
                from: 'sip:num-11234567890@test.com',
                to:  '+11234567891',
                callId: 'callId1',
                eventType: 'answer'
            }
        }
    };
    const mockApi = {
        Call: {
            transfer: td.function()
        }
    };
    router.getBandwidthApi = () => mockApi;
    td.when(Redis.prototype.sendCommand(td.matchers.anything())).thenResolve(JSON.stringify({
        userId: 'userId',
        apiToken: 'apiToken',
        apiSecret: 'apiSecret',
        phoneNumber: '+11234567890',
        sipUri: 'sip:num-11234567890@test.com'
    }));
    td.when(mockApi.Call.transfer('callId1', {
        transferCallerId: '+11234567890',
        transferTo: '+11234567891',
    })).thenResolve('newCallId');
    await routes(ctx, null);
    t.pass();
});

test.serial('POST /userId/callback should handle incoming calls', async t => {
    const ctx = {
        path: '/userId/callback',
        method: 'POST',
        request: {
            body: {
                from: '+11234567891',
                to:  '+11234567890',
                callId: 'callId2',
                eventType: 'answer'
            }
        }
    };
    const mockApi = {
        Call: {
            transfer: td.function()
        }
    };
    router.getBandwidthApi = () => mockApi;
    td.when(Redis.prototype.sendCommand(td.matchers.anything())).thenResolve(JSON.stringify({
        userId: 'userId',
        apiToken: 'apiToken',
        apiSecret: 'apiSecret',
        phoneNumber: '+11234567890',
        sipUri: 'sip:num-11234567890@test.com'
    }));
    td.when(mockApi.Call.transfer('callId1', {
        transferCallerId: '+11234567891',
        transferTo: 'sip:num-11234567890@test.com',
    })).thenResolve('newCallId2');
    await routes(ctx, null);
    t.pass();
});

test.serial('POST /loadMessages should return all messages for given number', async t => {
    const ctx = {
        path: '/loadMessages',
        method: 'POST',
        request: {
            body: {
                userId: 'userId',
                apiToken: 'apiToken',
                apiSecret: 'apiSecret',
                phoneNumber: '+11234567890',
                contactNumber: '+11234567891'
            }
        }
    };
    const mockApi = {
        Message: {
            list: td.function()
        }
    };
    router.getBandwidthApi = () => mockApi;
    td.when(mockApi.Message.list({size: 1000, to: '+11234567890', from: '+11234567891'})).thenResolve({
        messages: [{time: '2018-09-05T08:20:00'}],
        hasNextPage: true,
        getNextPage: () => Promise.resolve({
            messages: [{time: '2018-09-05T09:01:00'}],
            hasNextPage: false
        })
    });
    td.when(mockApi.Message.list({size: 1000, from: '+11234567890', to: '+11234567891'})).thenResolve({
        messages: [{time: '2018-09-05T09:00:00'}],
        hasNextPage: false
    });
    await routes(ctx, null);
    t.is(ctx.body.length, 3);
});

test.serial('POST /sendMessage should send a message', async t => {
    const ctx = {
        path: '/sendMessage',
        method: 'POST',
        request: {
            body: {
                userId: 'userId',
                apiToken: 'apiToken',
                apiSecret: 'apiSecret',
                from: '+11234567890',
                to: '+11234567891',
                text: 'Hello'
            }
        }
    };
    const mockApi = {
        Message: {
            send: td.function(),
            get: td.function()
        }
    };
    router.getBandwidthApi = () => mockApi;
    td.when(mockApi.Message.send({
        from: '+11234567890',
        to: '+11234567891',
        text: 'Hello'
    })).thenResolve({id: 'id'});
    td.when(mockApi.Message.get('id')).thenResolve({});
    await routes(ctx, null);
    t.truthy(ctx.body);
});

test('POST /registerForPush should save push token', async t => {
    const ctx = {
        path: '/registerForPush',
        method: 'POST',
        request: {
            body: {
                userId: 'userId',
                token: '1234567890'
            }
        }
    };
    await routes(ctx, null);
    t.pass();
});
