/**
 * Bootstrapper
 */
const copy = require('copy-dir');
const path = require('path');

const source = path.resolve(__dirname, '..', '_tpl');

module.exports = output => new Promise( (resolve, reject) => {
    copy(source, output, err => err ? reject(err) : resolve() );
});