/**
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