const Koa = require('koa');
const router = require('./routes');


function main() {
    const app = new Koa();
    app
        .use(router.routes())
        .use(router.allowedMethods());
    return app;
}

module.exports = main;

