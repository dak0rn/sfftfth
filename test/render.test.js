/**
 * Tests for the renderer
 */


const test = require('tape');
const utils = require('./fixture');
const prunk = require('prunk');
const path = require('path');
const Immutable = require('immutable');

// Default config
const defaultConfiguration = Immutable.Map({
    theme: '__theme__',
    output: '$'
});

const files = Immutable.fromJS([
    { meta: { static: true }, contents: 'file1' },
    { meta: { static: false }, contents: 'file2' },
]);

// Setup utility
const setup = (mock) => {
    prunk.mock('__theme__', mock);
    return require('../lib/render');
};

// Teardown utility
const teardown = () => utils.resetTestDoubles('../lib/render');

test('render; Exports a function', t => {
    t.plan(1);

    const render = setup();
    t.equals(typeof render, 'function');

    teardown();
    t.end();
});

test('render; invokes theme.index with all files and the config', t => {
    const theme = {
        index(list, config) {
            t.equal(list, files);
            t.equal(config, defaultConfiguration);
        }
    };

    t.plan(2);
    const render = setup(theme);
    render(defaultConfiguration, files);

    teardown();
    t.end();
});

test('render; correctly invokes theme.post', t => {
    const target = files.get(1);
    const theme = {
        post(post, meta, config, all) {
            t.equals(post, target.get('contents'));
            t.equals(meta, target.get('meta'));
            t.equals(config, defaultConfiguration);
            t.equals(all, files);
        }
    };

    t.plan(2);
    const render = setup(theme);
    render(defaultConfiguration, files);

    teardown();
    t.end();
});

test('render; correctly invokes theme.page', t => {
    const target = files.get(0);
    const theme = {
        page(page, meta, config, all) {
            t.equals(page, target.get('contents'));
            t.equals(meta, target.get('meta'));
            t.equals(config, defaultConfiguration);
            t.equals(all, files);
        }
    };

    t.plan(2);
    const render = setup(theme);
    render(defaultConfiguration, files);

    teardown();
    t.end();
});

test('render; adds the index file to the list', t => {
    const theme = {
        index() {
            return '42';
        }
    };

    t.plan(2);
    const render = setup(theme);
    render(defaultConfiguration, files)
        .then( updated => {
            const index = updated.last();

            t.equal( index.get('contents'), '42' );
            t.equal( index.get('outputPath'), path.resolve(defaultConfiguration.get('output'), 'index.html'));
        })
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});