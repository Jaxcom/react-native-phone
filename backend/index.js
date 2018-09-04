const Koa = require('koa');
const koaBody = require('koa-body');
const websockify = require('koa-websocket');
const router = require('./routes');
const wsRouter = require('./ws-routes');

require('dotenv').config();

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

