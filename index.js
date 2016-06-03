#!/usr/bin/env node
const parseConfig = require('./lib/parse-config');
const getFiles = require('./lib/get-files');
const parseFiles = require('./lib/parse-files');
const handleDrafts = require('./lib/handle-drafts');
const setPaths = require('./lib/set-file-paths');
const render = require('./lib/render');
const writeFiles = require('./lib/write-files');
const path = require('path');
const parseArgs = require('./lib/parse-args');

parseArgs()
    .then( args => path.isAbsolute(args.config) ? args.config : path.resolve(__dirname, args.config))
    .then( configPath => parseConfig(configPath) )
    .then( config => {

        return getFiles(config)
                .then( files => parseFiles(files) )
                .then( files => handleDrafts(config, files) )
                .then( files => setPaths(config, files) )
                .then( files => render(config, files) )
                .then( files => writeFiles(config, files) );
    })
    .then( () => console.log('Done') )
    .catch( e => console.log(e, e.stack));