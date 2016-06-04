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
 * Record definition for Files
 */
const Immutable = require('immutable');

module.exports = Immutable.Record({
    // Relative path of the file
    relativePath: void 0,

    // Absolute path of the file
    absolutePath: void 0,

    // Output file (dir + file name)
    outputPath: void 0,

    // Directory for the output
    outputDirectory: void 0,

    // Frontmatter metadata
    meta: Immutable.Map(),

    // The parsed markdown
    contents: void 0,

    uri: void 0
});