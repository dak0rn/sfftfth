#!/usr/bin/env node
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