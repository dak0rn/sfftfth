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