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
 * Tests for the file writer
 */

const test = require('tape');
const utils = require('./fixture');
const prunk = require('prunk');
const Immutable = require('immutable');

const setup = (mkdirpMock, fsMock) => {
    prunk.mock('mkdirp', mkdirpMock);
    prunk.mock('fs-promise', fsMock);

    return require('../lib/write-files');
};

// Teardown utility
const teardown = () => utils.resetTestDoubles('../lib/write-files');

// Default mocks
const defFs = {
    writeFile() {
        return Promise.resolve();
    }
};

const defConfig = Immutable.Map();

const defMkdir = (_, cb) => cb(null);

test('write-files; exports a function', t => {

    const writeFiles = setup();
    t.plan(1);
    t.equals(typeof writeFiles, 'function');
    t.end();
    teardown();
});

test('write-files; creates the output directories of files', t => {
    const files = Immutable.fromJS([
        { outputDirectory: 'a' },
        { outputDirectory: 'b' },
        { outputDirectory: 'c' }
    ]);
    const dirs = files.map( f => f.get('outputDirectory') );

    const mock = (name, cb) => {
        t.true( dirs.contains(name), name );
        cb(null);
    };

    t.plan( files.count() );

    const writeFiles = setup(mock, defFs);

    writeFiles(defConfig, files)
        .then( () => t.end() )
        .catch( e => t.fail(e) );

    teardown();
});

test('write-files; writes the files', t => {
    const files = Immutable.fromJS([
        { outputPath: 'a', contents: 'a' },
        { outputPath: 'b', contents: 'b' },
        { outputPath: 'c', contents: 'c' }
    ]);
    const paths = files.map( f => f.get('outputPath') );

    const mock = {
        writeFile(file, contents) {
            t.equal(file, contents, file);
            t.true( paths.contains(file) );
            return Promise.resolve();
        }
    };

    t.plan( files.count() * 2 );

    const writeFiles = setup(defMkdir, mock);

    writeFiles(defConfig, files)
        .then( () => t.end() )
        .catch( e => t.fail(e) );

    teardown();
});

test('write-files; fails if at least one directory cannot be created', t => {
    const files = Immutable.fromJS([
        { outputDirectory: '' },
        { outputDirectory: 'target' },
        { outputDirectory: '' }
    ]);

    const mock = (name, cb) => {
        cb( 'target' === name ? new Error() : null);
    };

    t.plan( 1 );

    const writeFiles = setup(mock, defFs);

    writeFiles(defConfig, files)
        .then( () => t.fail() )
        .catch( () => t.pass() );

    teardown();
});

test('write-files; fails if at least one file cannot be written', t => {
    const files = Immutable.fromJS([
        { outputPath: '', contents: '' },
        { outputPath: 'target', contents: 'target' },
        { outputPath: '', contents: '' }
    ]);

    const mock = {
        writeFile(file) {
            return 'target' === file ? Promise.reject() : Promise.resolve();
        }
    };

    t.plan( 1 );

    const writeFiles = setup(defMkdir, mock);

    writeFiles(defConfig, files)
        .then( () => t.fail() )
        .catch( () => t.pass() );

    teardown();
});