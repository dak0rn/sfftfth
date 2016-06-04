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
 * Test for the `set-file-paths` module.
 */
const test = require('tape');
const Immutable = require('immutable');
const path = require('path');
const setFilePaths = require('../lib/set-file-paths');

const config = Immutable.Map({
    output: path.resolve(__dirname, 'output'),
    contents: path.resolve(__dirname, 'contents'),
    baseUrl: '/blog'
});

const files = Immutable.fromJS([
    { relativePath: 'a/b/c/d.md' },
    { relativePath: 'y/x/z.md' },
    { relativePath: 'file.md' }
]);

test('set-file-paths; exports a function', t => {
    t.plan(1);
    t.equals(typeof setFilePaths, 'function');
    t.end();
});

test('set-file-paths; determines paths correctly in directory mode', t => {

    t.plan( files.count() * 2 );

    setFilePaths(config.set('outputMode', 'directory'), files)
        .then( updated => {

            files.map( file => file.get('relativePath') )
                .map( filepath => filepath.match(/(.*)\.md$/)[1] )
                .map( filepath => ({
                    outputPath: path.resolve(config.get('output'), filepath, 'index.html'),
                    outputDirectory: path.resolve(config.get('output'), filepath),
                }))
                .forEach( (filedef, idx) => {
                    t.equals( updated.getIn([idx, 'outputPath']), filedef.outputPath );
                    t.equals( updated.getIn([idx, 'outputDirectory']), filedef.outputDirectory );
                });

        })
        .catch( e => t.fail(e) )
        .then( () => t.end() );

});

test('set-file-paths; determines paths correctly in file mode', t => {

    t.plan( files.count() * 2 );

    setFilePaths(config.set('outputMode', 'file'), files)
        .then( updated => {

            files.map( file => file.get('relativePath') )
                .map( filepath => filepath.match(/(.*)\.md$/)[1] )
                .map( filepath => ({
                    outputPath: path.resolve(config.get('output'), `${filepath}.html`),
                    outputDirectory: path.resolve(config.get('output'), filepath, '..'),
                }))
                .forEach( (filedef, idx) => {
                    t.equals( updated.getIn([idx, 'outputPath']), filedef.outputPath );
                    t.equals( updated.getIn([idx, 'outputDirectory']), filedef.outputDirectory );
                });

        })
        .catch( e => t.fail(e) )
        .then( () => t.end() );

});

test('set-file-paths; determines URIs correctly in directory mode', t => {

    t.plan( files.count() );

    setFilePaths(config.set('outputMode', 'directory'), files)
        .then( updated => {

            files.map( file => file.get('relativePath') )
                .map( rel => rel.replace(/(.*)\.md$/, '/$1/index.html') )
                .forEach( (rel, idx) => {
                    t.equals( updated.getIn([idx, 'uri']), `${config.get('baseUrl')}${rel}` );
                });

        })
        .catch( e => t.fail(e) )
        .then( () => t.end() );

});

test('set-file-paths; determines URIs correctly in file mode', t => {

    t.plan( files.count() );

    setFilePaths(config.set('outputMode', 'file'), files)
        .then( updated => {

            files.map( file => file.get('relativePath') )
                .map( rel => rel.replace(/(.*)\.md$/, '/$1.html') )
                .forEach( (rel, idx) => {
                    t.equals( updated.getIn([idx, 'uri']), `${config.get('baseUrl')}${rel}` );
                });

        })
        .catch( e => t.fail(e) )
        .then( () => t.end() );

});