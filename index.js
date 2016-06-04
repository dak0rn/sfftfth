#!/usr/bin/env node
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

const parseConfig = require('./lib/parse-config');
const getFiles = require('./lib/get-files');
const parseFiles = require('./lib/parse-files');
const handleDrafts = require('./lib/handle-drafts');
const setPaths = require('./lib/set-file-paths');
const render = require('./lib/render');
const writeFiles = require('./lib/write-files');
const path = require('path');
const bootstrap = require('./lib/bootstrap');
const parseArgs = require('./lib/parse-args');

const performRender = configPath => parseConfig(configPath)
                                        .then( config => {

                                            return getFiles(config)
                                                    .then( files => parseFiles(files) )
                                                    .then( files => handleDrafts(config, files) )
                                                    .then( files => setPaths(config, files) )
                                                    .then( files => render(config, files) )
                                                    .then( files => writeFiles(config, files) );
                                        });

const performBootstraping = outpath => bootstrap(outpath);

parseArgs()
    .then( args => {
        // Bootstrap?
        if( args.b ) {
            // Build the path to write
            const fullpath = path.resolve(process.cwd(), args.b);

            console.log('Bootstrapping into', fullpath);
            return performBootstraping(fullpath);
        }

        // Render with config?
        if( args.c ) {
            const configPath = path.isAbsolute(args.c) ? args.c : path.resolve(process.cwd(), args.c);

            console.log('Rendering with config', configPath);
            return performRender(configPath);
        }


    })
    .then( () => console.log('Done') )
    .catch( e => console.log(e, e.stack));