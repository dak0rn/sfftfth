/**
 * Tests for the configuration parser
 */
const test = require('tape');
const utils = require('./fixture');
const prunk = require('prunk');

// Setup utility
const setup = (mock) => {
    prunk.mock('fs-promise', mock);
    return require('../lib/parse-config');
};

// Teardown utility
const teardown = () => utils.resetTestDoubles('../lib/parse-config');

// A valid configuration
const validConfig = {
    contents: '',
    output: '',
    theme: ''
};

/* Tests */

test('Exports a function', t => {
    const parseConfig = setup();

    t.plan(1);
    t.equals(typeof parseConfig, 'function');
    t.end();

    teardown();
});

test('Invokes the readFile function with the given path', t => {
    const givenPath = '_test_';
    t.plan(1);

    const mock = {
        readFile(path) {
            t.equal(path, givenPath);

            return Promise.resolve(validConfig);
        }
    };

    const parseConfig = setup(mock);

    parseConfig(givenPath);

    teardown();
});