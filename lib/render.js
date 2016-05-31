/**
 * Renderer
 * Renders the pages using the parsed markdown and
 * the theme
 */
const FileRecord = require('./FileRecord');
const path = require('path');

module.exports = (config, files) => new Promise( res => {

    const theme = require( config.get('theme') );
    const output = config.get('output');

    // The index
    const index = new FileRecord({
        outputPath: path.resolve(output, 'index.html'),
        outputDirectory: output,
        contents: theme.index(files, config)
    });

    // Process other files
    const updated = files.map( file =>
                file.set('contents',
                        // Invoke the theme function
                        theme[ file.getIn(['meta', 'static'], false) ? 'page' : 'post' ](
                            file.get('contents'),
                            file.get('meta'),
                            config,
                            file,
                            files
                        )));

    // Add the index
    res( updated.push(index) );
});