/**
 * Configuration parser
 */
const fs = require('fs-promise');

const defaultConfiguration = {
    baseUrl: '/'
};

const requiredKeys = [
    'contents',
    'output',
    'theme'
];

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

                return Object.assign({}, defaultConfiguration, config);
            });
};