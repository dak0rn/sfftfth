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
const moment = require('moment');

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
        .then( body => body.toString() )
        .then( body => frontmatter(body) )
        // Separate metadata and the file contents, parse the latter
        .then( data => {
            return parse(data.body)
                    .then( contents => {
                        return file.set('meta', Immutable.Map(data.attributes))
                                    .merge({ contents })
                                    .updateIn(['meta', 'date'], date => date || moment().format('YYYY-MM-DD') );
                    });
        })
)).then( rawlist => Immutable.List(rawlist) );
