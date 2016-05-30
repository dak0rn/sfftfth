/**
 * Test for the `set-file-paths` module.
 */
const test = require('tape');
const Immutable = require('immutable');
const path = require('path');
const setFilePaths = require('../lib/set-file-paths');

const config = Immutable.Map({
    output: path.resolve(__dirname, 'output'),
    contents: path.resolve(__dirname, 'contents')
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