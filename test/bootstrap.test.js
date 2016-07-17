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
 * Tests for the bootstrapper
 */

const test = require('tape');
const utils = require('./fixture');
const prunk = require('prunk');
const path = require('path');

// Setup utility
const setup = (copyMock) => {
    prunk.mock('recursive-copy', copyMock);

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
    const mock = (from, to) => {
        t.equals(to, toPath);
        t.equals(from, path.resolve(__dirname, '..', '_tpl'));
        return Promise.resolve();
    };
    const bootstrap = setup(mock);

    bootstrap(toPath)
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});

test('bootstrap; invokes the copy function with a config object', t => {
    t.plan(2);

    const mock = (from, to, obj) => {
        t.equals(typeof obj, 'object');
        t.equals(typeof obj.filter, 'function');
        return Promise.resolve();
    };
    const bootstrap = setup(mock);

    bootstrap('')
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});

test('bootstrap; filters for _tpl', t => {
    t.plan(4);

    const mock = (from, to, obj) => {

        t.equals(obj.filter('_tpl'), false);
        t.equals(obj.filter('_tpl/a/b/c'), false);
        t.equals(obj.filter('a/_tpl/b'), true);
        t.equals(obj.filter('filename'), true );

        return Promise.resolve();
    };
    const bootstrap = setup(mock);

    bootstrap('')
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});

test('bootstrap; fails if the library fails', t => {
    t.plan(1);

    const mock = () => {
        return Promise.reject();
    };
    const bootstrap = setup(mock);

    bootstrap()
        .then( () => t.fail() )
        .catch( () => t.pass() )
        .then( () => t.end() );

    teardown();
});