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
 * Tests for the file parser
 */

const test = require('tape');
const utils = require('./fixture');
const prunk = require('prunk');
const Immutable = require('immutable');
const moment = require('moment');

// Setup utility
const setup = (fsMock, markedMock, pygMock, frontMatterMock) => {
    prunk.mock('fs-promise', fsMock);
    prunk.mock('marked', markedMock);
    prunk.mock('pygmentize-bundled', pygMock);
    prunk.mock('front-matter', frontMatterMock);

    return require('../lib/parse-files');
};

// Teardown utility
const teardown = () => utils.resetTestDoubles('../lib/parse-files');

test('parse-files; exports a function', t => {
    const fsMock = {
        readFile() {
            return Promise.resolve('file contents');
        }
    };

    const markedMock = (content, cb) => {
        cb(null, content);
    };
    markedMock.setOptions = () => {};

    const pygMock = (conf, code, cb) => cb(null, 'happy code');
    const frontMatterMock = () => ({});

    const parseFile = setup(fsMock, markedMock, pygMock, frontMatterMock);

    t.plan(1);
    t.equals(typeof parseFile, 'function');
    t.end();
    teardown();
});

test('parse-files; sets pygmentize as highlighter for marked when required', t => {
    const fsMock = {
        readFile() {
            return Promise.resolve('file contents');
        }
    };

    const markedMock = (content, cb) => {
        cb(null, content);
    };
    markedMock.setOptions = opts => {
        t.equal(typeof opts.highlight, 'function');

        // Has to invoke the pygmentize function
        opts.highlight();
    };

    const pygMock = () => t.pass();
    const frontMatterMock = () => ({});

    t.plan(2);

    setup(fsMock, markedMock, pygMock, frontMatterMock);

    t.end();
    teardown();
});

test('parse-files; Tries to read all files', t => {
    const files = Immutable.fromJS([
        { absolutePath: '/b/c/d.md' },
        { absolutePath: '/x/z.md' },
        { absolutePath: './file.md' }
    ]);

    const fsMock = {
        readFile(name) {

            const valid = files.some( file => file.get('absolutePath') === name);
            t.true(valid, name);

            return Promise.resolve('file contents');
        }
    };

    const markedMock = (content, cb) => cb(null, content);
    markedMock.setOptions = () => {};
    const pygMock = () => {};
    const frontMatterMock = () => ({});

    t.plan(files.count());

    const parseFiles = setup(fsMock, markedMock, pygMock, frontMatterMock);

    parseFiles(files)
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});

test('parse-files; Passes read files to front-matter', t => {
    const files = Immutable.fromJS([
        { absolutePath: '/b/c/d.md' },
        { absolutePath: '/x/z.md' },
        { absolutePath: './file.md' }
    ]);

    const fsMock = {
        readFile(name) {
            return Promise.resolve(name);
        }
    };

    const markedMock = (content, cb) => cb(null, content);
    markedMock.setOptions = () => {};
    const pygMock = () => {};
    const frontMatterMock = name => {

        const valid = files.some( file => file.get('absolutePath') === name);
        t.true(valid, name);

        return {};
    };

    t.plan(files.count());

    const parseFiles = setup(fsMock, markedMock, pygMock, frontMatterMock);

    parseFiles(files)
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});

test('parse-files; Updates every file record with contents and metadata', t => {
    const files = Immutable.fromJS([
        { absolutePath: '/b/c/d.md' },
        { absolutePath: '/x/z.md' },
        { absolutePath: './file.md' }
    ]);
    const names = files.map( file => file.get('absolutePath') );

    const fsMock = {
        readFile(name) {
            return Promise.resolve(name);
        }
    };

    const markedMock = (content, cb) => cb(null, content);
    markedMock.setOptions = () => {};
    const pygMock = () => {};
    const frontMatterMock = name => {
        return {
            body: name,
            attributes: {
                name
            }
        };
    };

    t.plan(files.count() * 3);
    const today = moment().format('YYYY-MM-DD');

    const parseFiles = setup(fsMock, markedMock, pygMock, frontMatterMock);

    parseFiles(files)
        .then( updated => {
            updated.forEach( uf => {
                t.true( names.some( name => name === uf.get('contents') ) );
                t.true( names.some( name => name === uf.getIn(['meta', 'name'])) );
                t.true( names.some( () => today === uf.getIn(['meta', 'date'])) );
            });
        })
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});

test('parse-files; does not add a date metadata if given manually', t => {
    const files = Immutable.fromJS([
        { absolutePath: '/b/c/d.md' },
        { absolutePath: '/x/z.md' },
        { absolutePath: './file.md' }
    ]);
    const names = files.map( file => file.get('absolutePath') );

    const fsMock = {
        readFile(name) {
            return Promise.resolve(name);
        }
    };

    const markedMock = (content, cb) => cb(null, content);
    markedMock.setOptions = () => {};
    const pygMock = () => {};
    const frontMatterMock = name => {
        return {
            body: name,
            attributes: {
                name,
                date: name
            }
        };
    };

    t.plan(files.count() * 3);

    const parseFiles = setup(fsMock, markedMock, pygMock, frontMatterMock);

    parseFiles(files)
        .then( updated => {
            updated.forEach( uf => {
                t.true( names.some( name => name === uf.get('contents') ) );
                t.true( names.some( name => name === uf.getIn(['meta', 'name'])) );
                t.true( names.some( name => name === uf.getIn(['meta', 'date'])) );
            });
        })
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});


test('parse-files; failes if markdown fails', t => {
    const fsMock = {
        readFile() {
            return Promise.resolve('file contents');
        }
    };
    const files = Immutable.fromJS([
        { absolutePath: 'filepath' },
    ]);

    const markedMock = (content, cb) => {
        cb(new Error(), content);
    };
    markedMock.setOptions = () => {};

    const pygMock = () => {};
    const frontMatterMock = () => ({});

    t.plan(1);

    const parseFiles = setup(fsMock, markedMock, pygMock, frontMatterMock);

    parseFiles(files)
        .then( () => t.fail() )
        .catch( e => t.pass(e) )
        .then( () => t.end() );

    teardown();
});

test('parse-files; failes if pygmentize fails', t => {
    const fsMock = {
        readFile() {
            return Promise.resolve('file contents');
        }
    };
    const files = Immutable.fromJS([
        { absolutePath: 'filepath' },
    ]);

    // Error fixture
    const theError = new Error();

    // Marked configuration
    const conf = {};

    // The mock for marked that actually invokes
    // the highlighter
    const markedMock = (content, cb) => {

        // (2)
        conf.hl('', '', e => {
        //   ^^ - Invoke the markedOptions.highlight() function with
        //        a callback that checks the error:
            t.equals(e, theError);

            // Pass forward
            cb(e); // (4)
        });
    };
    markedMock.setOptions = obj => {
        conf.hl = obj.highlight;
    };

    const pygMock = (config, code, cb) => cb(theError); // (3)
    //                                       ^^^^^^^^ - Pass the error here back up
    const frontMatterMock = () => ({});

    t.plan(2);

    const parseFiles = setup(fsMock, markedMock, pygMock, frontMatterMock);

    parseFiles(files) // (1)
        .then( () => t.fail() )
        .catch( e => t.pass(e) ) // (5)
        .then( () => t.end() );

    teardown();
});

test('parse-files; continues of pygmentize succeeds and passes texts correctly', t => {
    const fsMock = {
        readFile() {
            return Promise.resolve('file contents');
        }
    };
    const files = Immutable.fromJS([
        { absolutePath: 'filepath' },
    ]);

    const text = 'abc';

    // Marked configuration
    const conf = {};

    const markedMock = (content, cb) => {

        conf.hl('', '', (a, value) => {
            t.equals(value, text);
            cb(null, value);
        });
    };
    markedMock.setOptions = obj => {
        conf.hl = obj.highlight;
    };

    const pygMock = (config, code, cb) => cb(null, text);
    const frontMatterMock = () => ({});

    t.plan(2);

    const parseFiles = setup(fsMock, markedMock, pygMock, frontMatterMock);

    parseFiles(files)
        .then( () => t.pass() )
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});