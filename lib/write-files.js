/**
 * File writer
 * Takes a bunch of files and writes them to disk
 */
const mkdir = require('mkdirp');
const fs = require('fs-promise');

const createDirectory = path => new Promise( (res, rej) => mkdir(path, err => err ? rej(err) : res(path) ));

module.exports = (config, files) =>
                    Promise.all( files.map( file => createDirectory(file.get('outputDirectory')) ).toJS() )
                    .then( () => Promise.all(
                                    files.map(
                                            file => fs.writeFile(file.get('outputPath'), file.get('contents'))).toJS()));