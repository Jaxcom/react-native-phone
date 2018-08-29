const Koa = require('koa');
const koaBody = require('koa-body');
const router = require('./routes');

require('dotenv').config();

async function main() {
    const app = new Koa();
    app
        .use(koaBody({}))
        .use(router.routes())
        .use(router.allowedMethods());
    return app;
}

module.exports = main;

