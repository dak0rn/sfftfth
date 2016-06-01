/**
 * Module that retrives the files to use
 */
const glob = require('glob-promise');
const Immutable = require('immutable');
const FileRecord = require('./FileRecord');
const path = require('path');

const relPath = config =>
                    file => file.set('relativePath',
                                     file.get('absolutePath').replace( config.get('contents') + path.sep, '' ) );

/**
 * Function that takes the engine's configuration and returns a
 * list of file records.
 *
 * @param  {Immutable.Map}  config  Engine configuration
 * @return {Promise<Immutable.List<FileRecord>>}
 */
module.exports = config => glob(`${config.get('contents')}/**/*.md`)
                            .then( files => files.map( file => new FileRecord({ absolutePath: file }) ) )
                            .then( files => files.map( relPath(config) ))
                            .then( files => Immutable.List(files) );
