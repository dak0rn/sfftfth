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
 * Tests for the argument parser
 */
const test = require('tape');
const utils = require('./fixture');
const prunk = require('prunk');
// const Immutable = require('immutable');
// const path = require('path');

// Setup utility
const setup = (argMock, packageMock) => {
    prunk.mock('argparse', argMock);
    prunk.mock('../package.json', packageMock);
    return require('../lib/parse-args');
};

// Teardown utility
const teardown = () => utils.resetTestDoubles('../lib/parse-args');

test('parse-args; creates a new command line argument parser w/ args', t => {
    t.plan(4);

    const package = {
        version: '$version',
        description: '$desc',
        name: '$name'
    };
    const parser = {
        ArgumentParser: function(args) {

            t.equals(args.addHelp, true);
            t.equals(args.version, package.version);
            t.equals(args.description, package.description);
            t.equals(args.prog, package.name);

            return { addArgument() {} };
        }
    };

    setup(parser, package);
    t.end();
    teardown();
});

test('parse-args; adds configuration flags', t => {
    t.plan(3);

    const flags = {
        '-c'(opts) {
            t.equals(opts.defaultValue, 'config.json');
            t.equals(opts.metavar, 'config file');
        },

        '-b'(opts) {
            t.equals(opts.metavar, 'directory name');
        }
    };

    const package = {};
    const parser = {
        ArgumentParser: function() {

            return {
                addArgument(name, opts) {
                    const validator = flags[name];

                    if( ! validator )
                        t.fail(`Unknown: ${name}`);
                    else
                        validator(opts);
                }
            };
        }
    };

    setup(parser, package);
    t.end();
    teardown();
});

test('parse-args; returns a promise with parsed arguments', t => {
    t.plan(1);

    const symbol = () => {};

    const package = {};
    const parser = {
        ArgumentParser: function() {

            return {
                addArgument() {},
                parseArgs() {
                    return symbol;
                }
            };
        }
    };

    const parseArgs = setup(parser, package);

    parseArgs()
        .then( args => t.equals(args, symbol) )
        .catch( e => t.fail(e) )
        .then( () => t.end() );

    teardown();
});