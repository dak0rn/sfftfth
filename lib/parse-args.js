/**
 * Parser for command line arguments
 */
const ArgumentParser = require('argparse').ArgumentParser;
const package = require('../package.json');

const parser = new ArgumentParser({
    addHelp: true,
    version: package.version,
    description: package.description,
    prog: package.name
});

parser.addArgument('config', {
    defaultValue: 'config.json',
    help: 'Path to the sfftfth config file, default: config.json'
});

module.exports = () => new Promise( res => res( parser.parseArgs() ));