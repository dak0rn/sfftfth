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
 * Parser for command line arguments
 */
const ArgumentParser = require('argparse').ArgumentParser;
const pkg = require('../package.json');

const parser = new ArgumentParser({
    addHelp: true,
    version: pkg.version,
    description: pkg.description,
    prog: pkg.name
});

parser.addArgument('-c', {
    defaultValue: 'config.json',
    metavar: 'config file',
    help: 'Path to the sfftfth config file, default: config.json'
});

parser.addArgument('-b', {
    metavar: 'directory name',
    help: 'Bootstrap a new setup in the given existing directory'
});

module.exports = () => new Promise( res => res( parser.parseArgs() ));