const Router = require('koa-router');
const Client = require('node-bandwidth');
const Redis = require('ioredis');
const debug = require('debug')('ws-routes');

const router = new Router();

router.getBandwidthApi = settings => {
    return new Client(settings);
}


router.all('/:userId/messages', async ctx => {
    debug('New websocket connection for user %s', ctx.params.userId);
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    const userData = JSON.parse((await redis.get(ctx.params.userId)) || '{}');
    if (!userData.phoneNumber) {
        return ctx.throw(404);
    }
    redis.subscribe(userData.phoneNumber);
    redis.on('message', (channel, message) => {
        debug('Sending message to websocket (userId %s)', ctx.params.userId);
        ctx.websocket.send(message);
    });
    ctx.websocket.on('close', () => redis.disconnect());
});


module.exports = router;