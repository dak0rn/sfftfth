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
