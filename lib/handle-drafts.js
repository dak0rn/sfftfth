/**
 * Draft handler
 */
const allFiles = () => true;
const noDrafts = file => ! file.getIn(['meta', 'draft']);

module.exports = (config, files) =>
                            Promise.resolve( files.filter( config.get('renderDrafts', false) ? allFiles : noDrafts ));