/**
 * Bootstrapper
 */
const copy = require('recursive-copy');
const path = require('path');

const source = path.resolve(__dirname, '..', '_tpl');

module.exports = output => copy(source, output);