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
 * Module that sets the file paths
 */
const path = require('path');

// Get the output file name for a file in directory mode
const directory = name => [name, 'index.html'].join( path.sep );
// Get the output file name for a file in file mode
const file = name => `${name}.html`;

// Get the output directory for a file in directory mode
const directoryDirectory = name => name;
// Get the output directory for a file in file mode
const fileDirectory = name => path.dirname(name);

// Remove the file extension
const removeExtension = name => name.match(/(.*)\.md$/)[1];

module.exports = (config, files) => new Promise( res => {

    const mode = config.get('outputMode');
    const base = config.get('output');

    const getPath = 'directory' === mode ? directory : file;
    const getDir = 'directory' === mode ? directoryDirectory : fileDirectory;

    const mapped = files.map( lf => {
        const noExtPath = removeExtension(lf.get('relativePath'));
        const outputPath = getPath(noExtPath);
        const outputDirectory = getDir(noExtPath);

        return lf.merge({
            outputPath: path.resolve(base, outputPath),
            outputDirectory: path.resolve(base, outputDirectory),
            uri: `${config.get('baseUrl')}/${outputPath}`
        });
    });

    res(mapped);
});