/**
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