/**
 * Example theme
 */

/**
 * Renders the beginning of the document.
 *
 * @param  {string} title   Page title
 * @param  {string} baseUrl Base URL o fthe page
 * @return {string}         HTML
 */
const head = (title, baseUrl) => `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="${baseUrl}/page.css" />
    </head>
    <body>
        <div class="page-container">`;

/**
 * Renders the end of the document.
 *
 * @return {string} HTML
 */
const tail = () => `</div>
    </body>
</html>`;

/**
 * Renders the page header with the navigation.
 *
 * @param  {array<object>} files      All files
 * @param  {boolean=} renderBack      Render the back button? Default false.
 * @return {string}                   HTML
 */
const pageHeader = (files, renderBack) => `<div id="page-header">
    <h1 class="page-title">sfftfth</h1>
    <ul class="page-list">
        ${ renderBack ? '<li class="page"><a href="${baseUrl}/">&laquo;</a></li>' : '' }${
        files.filter( file => !! file.meta.static )
            .map( file => `<li class="page"><a href="${file.uri}">${file.meta.title}</a></li>` )
            .join('')
    }</ul>
</div>`;

module.exports = {

    /**
     * Function invoked for the index page.
     *
     * @param  {array<object>} files  List of files
     * @param  {object} config Page configuration
     * @return {string}        HTML
     */
    index(files, config) {
        return `${head(config.title, config.baseUrl)}
            <div class="page-content" id="index-page">
                ${ pageHeader(files) }
                <ul class="post-list">${
                    files.filter( file => ! file.meta.static )
                        .map( file => `<li class="post">
                                            <a href="${file.uri}">${file.meta.title}</a>&nbsp;
                                            <span class="post-date">(${ file.meta.date })</span>
                                        </li>` )
                        .join('')
                }</ul>
            </div>
        ${tail()}`;
    },

    /**
     * Function invoked to render a post.
     *
     * @param  {string} contents HTML contents
     * @param  {object} meta     Meta information
     * @param  {object} config   Page configuration
     * @param  {object} file     Whole file object
     * @param  {array<object>} files    List of file objects
     * @return {string}          HTML
     */
    post(contents, meta, config, file, files) {
        return `${head(meta.title, config.baseUrl)}
            ${ pageHeader(files, true) }
            <div class="page-content" id="post-page">
                ${ contents }
                <div class="page-meta">
                  ${ meta.date }
                </div>
            </div>
        ${tail()}`;
    },

    /**
     * Function invoked to render a page, that is, a post that has `static: true` in its meta.
     *
     * @param  {string} contents HTML contents
     * @param  {object} meta     Meta information
     * @param  {object} config   Page configuration
     * @param  {object} file     Whole file object
     * @param  {array<object>} files    List of file objects
     * @return {string}          HTML
     */
    page() {
        return this.post.apply(this, arguments);
    }

};