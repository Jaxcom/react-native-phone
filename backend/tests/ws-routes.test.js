const test = require('ava');
const Router = require('koa-router');
const td = require('testdouble');
const router = require('../ws-routes');
const routes = router.routes();


const mockRedis = {
    get: td.function(),
    subscribe: td.function(),
    on: td.function(),
    disconnect: td.function()
};

router.getRedis = () => mockRedis;


test('it should return router instance', async t => {
    t.true(router instanceof Router);
});


test('/:userId/messages should subscribe to new messages', async t => {
    const ctx = {
        path: '/userId/messages',
        method: 'GET',
        websocket: {
            send: td.function(),
            on: td.function()
        }
    };
    
    td.when(mockRedis.get('userId')).thenResolve('{"phoneNumber": "+11234567890"}');
    let messageHandler = null
    td.when(mockRedis.on('message', td.matchers.anything())).thenDo((name, handler) => {
        messageHandler = handler;
    });
    let closeHandler = null
    td.when(ctx.websocket.on('close', td.matchers.anything())).thenDo((name, handler) => {
        closeHandler = handler;
    });
    await routes(ctx, null);
    td.verify(mockRedis.subscribe('+11234567890'), {times: 1});
    t.true(typeof messageHandler === 'function');
    t.true(typeof closeHandler === 'function');
    messageHandler('+11234567890', 'data');
    td.verify(ctx.websocket.send('data'), {times: 1});
    closeHandler();
    td.verify(mockRedis.disconnect(), {times: 1});
    t.pass();
});

test('/:userId/messages should throw 404 if user data is not found', async t => {
    const ctx = {
        path: '/userId1/messages',
        method: 'GET',
        throw: td.function()
    };
    
    td.when(mockRedis.get('userId1')).thenResolve(null);
    await routes(ctx, null);
    td.verify(ctx.throw(404));
    t.pass();
});
