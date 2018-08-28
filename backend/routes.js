const Router = require('koa-router');
const {application, phoneNumber} = require("@bandwidth/node-bandwidth-extra");
const Client = require("node-bandwidth");

const router = new Router();

router.post('/login', async ctx => {
    const {userId, domainId, apiToken, apiSecret, phoneNumber} = ctx.request.body;
    const api = new Client({userId, apiToken, apiSecret});
    const appId = await application.getOrCreateApplication(api, {}, ctx.request.hostname, true);
});

module.exports = router;