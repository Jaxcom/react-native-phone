const test = require('ava');
const main = require('../index');

test('main() should return app instance', async t => {
    const app = await main();
    t.truthy(app);
});