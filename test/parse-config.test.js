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
 * Tests for the configuration parser
 */
const test = require('tape');
const utils = require('./fixture');
const prunk = require('prunk');
const path = require('path');

// Setup utility
const setup = (mock) => {
    prunk.mock('fs-promise', mock);
    return require('../lib/parse-config');
};

// Teardown utility
const teardown = () => utils.resetTestDoubles('../lib/parse-config');

// A valid configuration
const validConfig = {
    contents: 'a',
    output: 'b',
    theme: 'c'
};

// Optional keys added if not present
const optionalKeys = [
    'baseUrl',
    'outputMode',
    'renderDrafts'
];

/* Tests */

test('parse-config; Exports a function', t => {
    const parseConfig = setup();

    t.plan(1);
    t.equals(typeof parseConfig, 'function');

    teardown();
});

test('parse-config; Invokes the readFile function with the given path', t => {
    const givenPath = '_test_';
    t.plan(1);

    const mock = {
        readFile(p) {
            t.equal(p, givenPath);
            t.end();

            return Promise.resolve(validConfig);
        }
    };

    const parseConfig = setup(mock);

    parseConfig(givenPath);

    teardown();
});

test('Returns a rejected promise if the library does, too', t => {
    t.plan(1);

    const mock = {
        readFile() {
            return Promise.reject();
        }
    };

    const parseConfig = setup(mock);

    parseConfig('')
        .then( () => t.fail('fulfilled') )
        .catch( () => t.pass('rejected') )
        .then( () => t.end() );

    teardown();
});

test('parse-config; Returns a rejected promise if the config is not an valid JSON', t => {
    t.plan(1);

    const mock = {
        readFile() {
            return Promise.resolve('$_;"');
        }
    };

    const parseConfig = setup(mock);

    parseConfig('')
        .then( () => t.fail('fulfilled') )
        .catch( () => t.pass('rejected') )
        .then( () => t.end() );

    teardown();
});

test('parse-config; Returns a rejected promise if the config does not contain mandatory keys', t => {
    // Build a list of configuration objects
    const keys = Object.keys(validConfig);
    const configs = keys.slice(0, keys.length - 1) // Omit one to have only invalid keys
                        .reduce( (acc, cur) => {
                            const prev = acc[ acc.length - 1];
                            return acc.concat([ Object.assign({}, prev, { [cur]: true }) ]);
                        }, [ {} ]);

    t.plan( configs.length );

    // Create handler functions
    return configs.map( config => () => {
        const mock = {
            readFile() {
                return Promise.resolve(JSON.stringify(config));
            }
        };
        const confStr = JSON.stringify( config );
        const parseConfig = setup(mock);

        return parseConfig(config)
                .then( () => t.fail('Failed ' + confStr) )
                .catch( () => t.pass('passed ' + confStr ) )
                .then( () => teardown() );
    })
    // Build Promise chain
    .reduce( (acc, cur) => acc.then( cur ), Promise.resolve() )
    .then( () => t.end() );

});

test('parse-config; Returns a rejected promise if mandatory keys are null', t => {
    // Build a list of configuration objects
    const keys = Object.keys(validConfig);
    const configs = keys.reduce( (acc, cur) => {
        const prev = acc[ acc.length - 1];
        return acc.concat([ Object.assign({}, prev, { [cur]: null }) ]);
    }, [ {} ]);

    t.plan( configs.length );

    // Create handler functions
    return configs.map( config => () => {
        const mock = {
            readFile() {
                return Promise.resolve(JSON.stringify(config));
            }
        };
        const confStr = JSON.stringify( config );
        const parseConfig = setup(mock);

        return parseConfig(config)
                .then( () => t.fail('Failed ' + confStr) )
                .catch( () => t.pass('passed ' + confStr) )
                .then( () => teardown() );
    })
    // Build Promise chain
    .reduce( (acc, cur) => acc.then( cur ), Promise.resolve() )
    .then( () => t.end() );

});

test('parse-config; Merges missing optional keys', t => {
    t.plan( optionalKeys.length );

    const mock = {
        readFile() {
            return Promise.resolve(JSON.stringify(validConfig));
        }
    };

    const parseConfig = setup(mock);

    parseConfig('')
        .then( conf => {
            optionalKeys.forEach( key => t.true(conf.has(key), `has optional "${key}"`) );
        })
        .catch( () => t.fail('rejected') )
        .then( () => t.end() );

    teardown();
});

test('parse-config; Does not overwrite optional keys if present', t => {
    t.plan( optionalKeys.length );
    const output = optionalKeys.reduce( (acc, cur) => Object.assign({}, acc, { [cur]: cur }), validConfig);

    const mock = {
        readFile() {
            return Promise.resolve(JSON.stringify(output));
        }
    };

    const parseConfig = setup(mock);

    parseConfig('')
        .then( conf => {
            optionalKeys.forEach( key => t.equal(conf.get(key), key) );
        })
        .catch( () => t.fail('rejected') )
        .then( () => t.end() );

    teardown();
});

test('parse-config; Correctly resolves files', t => {
    const mock = {
        readFile() {
            return Promise.resolve(JSON.stringify(validConfig));
        }
    };
    const parseConfig = setup(mock);

    t.plan( Object.keys(validConfig).length );

    parseConfig('')
        .then( conf => {

            Object.keys( validConfig )
                .map( key => ({ key, value: validConfig[key] }))
                .forEach( def => t.equal(conf.get(def.key), path.resolve('', def.value)));
        })
        .catch( e => t.fail('rejected ' + e) )
        .then( () => t.end() );

    teardown();
});

test('parse-config; ensures no trailing slash', t => {
    t.plan( 1 );

    const mock = {
        readFile() {
            return Promise.resolve(JSON.stringify(Object.assign({ baseUrl: '/a/b/c/' }, validConfig)));
        }
    };

    const parseConfig = setup(mock);

    parseConfig('')
        .then( config => {
            t.equals( config.get('baseUrl'), '/a/b/c' );
        })
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});