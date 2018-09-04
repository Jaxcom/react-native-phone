const Router = require('koa-router');
const Client = require('node-bandwidth');
const Redis = require('ioredis');
const debug = require('debug')('ws-routes');

const router = new Router();

router.getBandwidthApi = settings => {
    return new Client(settings);
}


router.all('/:userId/messages', async ctx => {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    await redis.connect();
    const userData = JSON.parse((await redis.get(ctx.params.userId)) || '{}');
    redis.subscribe(userData.phoneNumber);
    redis.on('message', (channel, message) => {
        debug('Sending message to websocket (userId %s)', ctx.params.userId);
        ctx.websocket.send(message);
    });
    cxt.websocket.on('close', () => redis.disconnect());
});


module.exports = router;