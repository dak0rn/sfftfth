# sfftfth
### A simple static site generator

[![Coverage Status](https://coveralls.io/repos/github/dak0rn/sfftfth/badge.svg?branch=master)](https://coveralls.io/github/dak0rn/sfftfth?branch=master) [![Build Status](https://travis-ci.org/dak0rn/sfftfth.svg?branch=master)](https://travis-ci.org/dak0rn/sfftfth)

`sfftfth` is a small static site generator written in JavaScript. It provides a simple command line interface to transform Markdown files into static HTML pages. It is driven by a configuration and a theming file. `sfftfth` is free and Open Source (Apache-2.0) software.

It aims to be a small utility making static page generation easy while still providing a lot of flexibility. Take 10 Minutes and a ☕️&nbsp; to read this short manual. It does not only provide you with everything to get started but also the complete documentation.

## Installation

Install the cli with

```bash
npm install -g sfftfth
```


## Quickstart

You can bootstrap a small example with `sfftfth -b dirname`. An example configuration, a theme as well as a few markdown files will then be created in the `dirname` folder.

Change to that folder and run `sfftfth` (or `sfftfth -c config.json`, both are equivalent) to render the markdown files. `sfftfth` does not come with a web server (yet), so if you want to serve the generated files, either drop the `output` directory onto a web server or change to the directory and create a handy Python web server there `python -m SimpleHTTPServer 8411` (Python has to be installed).

## Configuration

The configuration file is used when rendering Markdown files into HTML. It is a JSON file and might
look as follows:

```json
{
    "output": "output",
    "contents": "contents",
    "theme": "theme.js",
    "baseUrl": "/",
    "title": "Pages",
    "renderDrafts": false,
    "outputMode": "directory"
}
```

### Mandatory keys

- `output` is the name of the output directory of the rendered files, either relative to the path of the configuration
  file or an absolute path.
- The `contents` key references the directory with files. This can be either relative or absolute again.
- The theme to use is referenced with the `theme` key.

### Optional keys

- `baseUrl` is an optional key and provides the base URL of the pages allowing to serve them from a
  subdirectory. It defaults to `/`.
- `renderDrafts` indicates whether to render files that have a `draft: true` flag in their Frontmatter.
   Defaults to `false`.
- The `outputMode` flag determines the way files are created:
  - `directory` (the default) indicates that directories are created for every file.<br />
    `a/b/c/d.md` will then be rendered to `a/b/c/d/index.html`.
  - `file` indicates that files are created for every file.<br />
    `a/b/c/d.md` will then be rendered to `a/b/c/d.html`.

### Other keys

- Any other key (e.g. `title`) is not used by `sfftfth` but is provided to the theme functions.

## Theming

The theme referenced by the configuration is supposed to be a JavaScript file exporting an object with
three functions:

```JavaScript
module.exports = {

    index(files, config) {},

    post(content, meta, config, file, files) {},

    page(content, meta, config, file, files) {}
}
```

- `index` creates the `index.html` file and is invoked with the list of files and the configuration.
  See below for the accessible information of the file list.
- `post` will be invoked for every file that is not static (not `static: true` in its Frontmatter). It
  gets the rendered markdown, its frontmatter info, the configuration, the corresponding file record and
  the list of all files.
- `page` will be invoked for every file that is static (`static: true` in its Frontmatter). It
  gets the rendered markdown, its frontmatter info, the configuration, the corresponding file record and
  the list of all files.

All functions are supposed to return complete HTML files as strings. That allows to use either *native* features
like string interpolation or even add a full-featured templating engine like Handlebars or Jade.

### File record

Files (both in the list and as a separate argument) are represented using a file record. It consists of the
following fields:

```javascript
{
    // Relative path of the file
    relativePath: void 0,

    // Absolute path of the file
    absolutePath: void 0,

    // Output file (dir + file name)
    outputPath: void 0,

    // Directory for the output
    outputDirectory: void 0,

    // Frontmatter metadata
    meta: {
        // A date, set automatically to today in `YYYY-MM-DD` if not given
        date: void 0
    },

    // The parsed markdown
    contents: void 0,

    // Relative URI to the post/page
    uri: void 0
}
```

## File structure

`sfftfth` collects all Markdown files in the given `contents` directory recursively.
The file and folder structure represents a file's URI when rendered. Depending on the configuration, files are
either stored in separate directories as `index.html` or as rendered HTML file with the original name.

- `outputMode = 'directory'`
  - `about.md` &rarr; `about/index.html`
  - `pages/blog.md` &rarr; `pages/blog/index.html`
  - `projects/1998/parade.md` &rarr; `projects/1998/parade/index.html`
- `outputMode = 'file'`
  - `about.md` &rarr; `about.html`
  - `pages/blog.md` &rarr; `pages/blog.html`
  - `projects/1998/parade.md` &rarr; `projects/1998/parade.html`

## Rendering

Rendering is started with the `sfftfth` cli. If the configuration file is named `config.json` it can
be invoked without any arguments from the same directory. If the config has a different name it has to be
named explicitly.

```bash
sfftfth
# Same as:
sfftfth -c config.js
```

## Bootstrapping

To provide a starting point, `sfftfth` can generate a sample configuration, sample theme and a few markdown files.
The CLI uses the `-b` flag for that:

```bash
sfftfth -b example-directory
```

## CLI help


    usage: sfftfth [-h] [-v] [-c config file] [-b directory name]


    A very simple static site generator

    Optional arguments:
      -h, --help         Show this help message and exit.
      -v, --version      Show program's version number and exit.
      -c config file     Path to the sfftfth config file, default: config.json
      -b directory name  Bootstrap a new setup in the given existing directory

## Errata

Found a bug or missing a feature?<br />
Feel free to [open an issue](https://github.com/dak0rn/sfftfth/issues) or
[create a pull request](https://github.com/dak0rn/sfftfth/pulls).