/**
 * Parser for markdown files
 *
 * Reads files, extracts markdown and updates the file list.
 * Also provides some stats.
 */
const marked = require('marked');
const fs = require('fs-promise');
const frontmatter = require('front-matter');
const pyg = require('pygmentize-bundled');
const Immutable = require('immutable');

// Set options for the markdown parser
marked.setOptions({
    highlight(code, lang, cb) {
        pyg({lang, format: 'html'}, code, (err, res) => cb(err, res && res.toString()));
    }
});

// Parse the given markdown
const parse = markdown => new Promise( (resolve, reject) => {
    marked(markdown, (err, content) => err ? reject(err) : resolve(content));
});

/**
 * parse-files.
 * Takes a list of files, loads their contents, extracts meta data
 * and updates the file list to contain all of them.
 *
 * @param  {Immutable.List}  files  Files to process
 * @return {Promise<Immutable.List<FileRecord>>}  List of updated files
 */
module.exports = (files) => Promise.all( files.map( file =>
    fs.readFile( file.get('absolutePath') )
        .then( body => frontmatter(body) )
        // Separate metadata and the file contents, parse the latter
        .then( data => {
            return parse(data.body)
                    .then( contents => {
                        return file.set('meta', Immutable.Map(data.attributes))
                                    .merge({ contents });
                    });
        })
)).then( rawlist => Immutable.List(rawlist) );
