/**
 * Tests for the bootstrapper
 */

const test = require('tape');
const utils = require('./fixture');
const prunk = require('prunk');
const path = require('path');

// Setup utility
const setup = (copyMock) => {
    prunk.mock('copy-dir', copyMock);

    return require('../lib/bootstrap');
};

// Teardown utility
const teardown = () => utils.resetTestDoubles('../lib/bootstrap');

test('bootstrap; exports a function', t => {
    t.plan(1);
    t.equals( typeof setup(), 'function');
    t.end();
    teardown();
});

test('bootstrap; copies correctly', t => {
    t.plan(2);

    const toPath = '$$toPath$$';
    const mock = (from, to, cb) => {
        t.equals(to, toPath);
        t.equals(from, path.resolve(__dirname, '..', '_tpl'));
        cb(null);
    };
    const bootstrap = setup(mock);

    bootstrap(toPath)
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});

test('bootstrap; fails if the library fails', t => {
    t.plan(1);

    const mock = (x, y, cb) => {
        cb( new Error() );
    };
    const bootstrap = setup(mock);

    bootstrap()
        .then( () => t.fail() )
        .catch( () => t.pass() )
        .then( () => t.end() );

    teardown();
});