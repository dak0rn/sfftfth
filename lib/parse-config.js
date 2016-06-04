/**
 * Configuration parser
 */
const fs = require('fs-promise');
const Immutable = require('immutable');
const path = require('path');

const defaultConfiguration = {
    baseUrl: '/',
    outputMode: 'directory',
    renderDrafts: false
};

const requiredKeys = [
    'contents',
    'output',
    'theme'
];

const ensureNoTrailingSlash = what => null !== what.match(/(.*)\/$/) ? what.substr(0, what.length - 1) : what;

/**
 * Loads and validates the configuration file stored
 * at the given location.
 * Missing optional keys will be merged in with their
 * default values.
 *
 * @param  {string}  configPath  Path to the file
 * @return  {Promise<Object>}  Validated configuration.
 */
module.exports = configPath => {
    return fs.readFile( configPath )
            .then( content => JSON.parse(content) )
            .then( config => {
                const missing = requiredKeys.find( key => 'undefined' === typeof config[key] || null === config[key] );

                if( missing )
                    return Promise.reject(`Configuration is missing key "${missing}"`);

                return Immutable.Map(defaultConfiguration)
                                .merge(config)
                                .merge({
                                    contents: path.resolve(path.dirname(configPath), config.contents),
                                    output: path.resolve(path.dirname(configPath), config.output),
                                    theme: path.resolve(path.dirname(configPath), config.theme)
                                })
                                .update('baseUrl', url => ensureNoTrailingSlash(url));
            });
};