const Koa = require('koa');
const koaBody = require('koa-body');
const websockify = require('koa-websocket');
const Client = require('node-bandwidth');

require('dotenv').config();

function prepareRouter(router) {
    router.getBandwidthApi = settings => {
        return new Client(settings);
    };
    return router;
}

const router = prepareRouter(require('./routes'));
const wsRouter = prepareRouter(require('./ws-routes'));


async function main() {
    const app = websockify(new Koa());
    app
        .use(koaBody({}))
        .use(router.routes())
        .use(router.allowedMethods());
    app.ws.use(wsRouter.routes());
    return app;
}

module.exports = main;

