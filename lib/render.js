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
 * Renderer
 * Renders the pages using the parsed markdown and
 * the theme
 */
const FileRecord = require('./FileRecord');
const path = require('path');

module.exports = (config, files) => new Promise( res => {

    const theme = require( config.get('theme') );
    const output = config.get('output');

    const rawFiles = files.toJS();
    const rawConfig = config.toJS();

    // The index
    const index = new FileRecord({
        outputPath: path.resolve(output, 'index.html'),
        outputDirectory: output,
        contents: theme.index(rawFiles, rawConfig)
    });

    // Process other files
    const updated = files.map( file =>
                file.set('contents',
                        // Invoke the theme function
                        theme[ file.getIn(['meta', 'static'], false) ? 'page' : 'post' ](
                            file.get('contents'),
                            file.get('meta').toJS(),
                            rawConfig,
                            file.toJS(),
                            rawFiles
                        )));

    // Add the index
    res( updated.push(index) );
});