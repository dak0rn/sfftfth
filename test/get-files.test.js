/**
 * Test for the `get-files` module.
 */
const test = require('tape');
const utils = require('./fixture');
const prunk = require('prunk');
const Immutable = require('immutable');
const path = require('path');

// Default config
const defaultConfiguration = Immutable.Map({
    contents: __dirname
});

// Setup utility
const setup = (mock) => {
    prunk.mock('glob-promise', mock);
    return require('../lib/get-files');
};

// Teardown utility
const teardown = () => utils.resetTestDoubles('../lib/get-files');

test('get-files; Exports a function', t => {

    t.plan(1);

    const getFiles = setup();

    t.equals(typeof getFiles, 'function');
    t.end();
    teardown();
});

test('get-files; Function takes one argument', t => {
    t.plan(1);
    const getFiles = setup();
    t.equals(getFiles.length, 1);
    t.end();
    teardown();
});

test('get-files; Transforms a list of files into a list of FileRecords', t => {
    const mock = () => Promise.resolve(['a', 'b', 'c']);
    const getFiles = setup(mock);

    t.plan(3);

    getFiles(defaultConfiguration)
        .then( list => {
            t.true( Immutable.List.isList(list) );
            t.equals(list.count(), 3);

            // We can't really detect records m(
            const allImmutable = list.every( file => 'object' === typeof file && file.__toJS );
            t.true(allImmutable);
        })
        .catch( () => t.fail('getFiles(defaultConfiguration) failed: ' ) )
        .then( () => t.end() );

    teardown();
});

test('get-files; correctly sets the relative path', t => {
    // In production glob is given an absolute path and it also returns
    // absolute paths
    const relatives = [ 'x', 'y', 'z' ];
    const globs = relatives.map( gl => path.resolve(__dirname, gl) );
    const mock = () => Promise.resolve(globs);
    const getFiles = setup(mock);

    t.plan( globs.length );

    getFiles(defaultConfiguration)
        .then( list => list.forEach((file, idx) => t.equals(file.get('relativePath'), relatives[idx])))
        .then( () => t.end() );

    teardown();
});

test('get-files; correctly determines paths', t => {
    const globs = ['file', '__', '2'].map( p => path.resolve(__dirname, p) );
    const mock = () => Promise.resolve(globs);
    const getFiles = setup(mock);

    t.plan(3);

    getFiles(defaultConfiguration)
        .then( list => {
            list.forEach( (file, idx) => t.equals(file.get('absolutePath'), globs[idx]));
        })
        .catch( () => t.fail('rejected') )
        .then( () => t.end() );

    teardown();
});