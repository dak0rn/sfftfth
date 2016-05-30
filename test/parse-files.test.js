/**
 * Tests for the file parser
 */

const test = require('tape');
const utils = require('./fixture');
const prunk = require('prunk');
const Immutable = require('immutable');

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
    const frontMatterMock = () => {};

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
    const frontMatterMock = () => {};

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

    t.plan(files.count() * 2);

    const parseFiles = setup(fsMock, markedMock, pygMock, frontMatterMock);

    parseFiles(files)
        .then( updated => {
            console.log(updated);
            updated.forEach( uf => {
                t.true( names.some( name => name === uf.get('contents') ) );
                t.true( names.some( name => name === uf.getIn(['meta', 'name'])) );
            });
        })
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});