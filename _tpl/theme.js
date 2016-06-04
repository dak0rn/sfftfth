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

const tail = () => `</div>
    </body>
</html>`;

const pageHeader = (files, renderBack) => `<div id="page-header">
    <h1 class="page-title">sfftfth</h1>
    <ul class="page-list">
        ${ renderBack ? `<li class="page"><a href="/">&laquo;</a></li>`: '' }${
        files.filter( file => !! file.meta.static )
            .map( file => `<li class="page"><a href="${file.uri}">${file.meta.title}</a></li>` )
            .join('')
    }</ul>
</div>`;

module.exports = {

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

    page() {
        return this.post.apply(this, arguments);
    }

};