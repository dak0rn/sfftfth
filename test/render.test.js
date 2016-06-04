/**
 * Copyright 2016 Daniel Koch
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
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
            t.equals(JSON.stringify(list), JSON.stringify(files.toJS()));
            t.equals(JSON.stringify(config), JSON.stringify(defaultConfiguration.toJS()));
        },
        post() { return ''; },
        page() { return ''; }
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
        post(post, meta, config, file, all) {
            t.equals(post, target.get('contents'));
            t.equals(JSON.stringify(meta), JSON.stringify(target.get('meta').toJS()) );
            t.equals(JSON.stringify(config), JSON.stringify(defaultConfiguration.toJS()));
            t.equals(JSON.stringify(all), JSON.stringify(files.toJS()));
            t.equals(JSON.stringify(file), JSON.stringify(target.toJS()));
        },
        index() { return ''; },
        page() { return ''; }
    };

    t.plan(5);
    const render = setup(theme);
    render(defaultConfiguration, files)
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});

test('render; correctly invokes theme.page', t => {
    const target = files.get(0);
    const theme = {
        page(page, meta, config, file, all) {
            t.equals(page, target.get('contents'));
            t.equals(JSON.stringify(meta), JSON.stringify(target.get('meta').toJS()) );
            t.equals(JSON.stringify(config), JSON.stringify(defaultConfiguration.toJS()));
            t.equals(JSON.stringify(all), JSON.stringify(files.toJS()));
            t.equals(JSON.stringify(file), JSON.stringify(target.toJS()));
        },
        index() { return ''; },
        post() { return ''; }
    };

    t.plan(5);
    const render = setup(theme);
    render(defaultConfiguration, files)
            .catch( e => t.fail(e) )
            .then( () => t.end() );

    teardown();
});

test('render; adds the index file to the list', t => {
    const theme = {
        index() {
            return '42';
        },
        page() { return ''; },
        post() { return ''; }
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