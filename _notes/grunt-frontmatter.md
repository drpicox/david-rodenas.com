---
title: grunt-frontmatter
source: "https://github.com/drpicox/grunt-frontmatter"
website: "http://drpicox.github.io/grunt-frontmatter"
image:
  src: http://tomgurney.co.uk/wp-content/uploads/2015/10/Grunt-Logo.png
  width: 900
  height: 900
description: > 
  A grunt task able to extract YAML front-matter
  from files and integrate all into a single JSON file.
tags:
  - projects
  - javascript
  - node
  - yaml
  - front-matter
  - grunt
  - jekyll
  - assemble
  
---

* replace with ToC
{:toc}

## Overview

This is a grunt task able to generate JSON data from
[front-matter](./front-matter) metadata
present in multiple files.

As example, given the following directory structure:

    .
    ├── Gruntfile.coffee
    ├── package.json
    └── source
        ├── articles
        │   ├── bellflower.md    <--
        │   ├── fiddler.html     <--
        │   └── healthy.md       <--
        ├── index.html
        ├── styles.css
        └── app.js

it can generate `articles.json` file as follows:

    .
    ├── Gruntfile.coffee
    ├── package.json
    ├── source
    └── release
        └── articles.json        <--


## Setup

Install it in your project with npm:

```bash
$ npm install --save-dev grunt-frontmatter
```

After it configure your _Gruntfile.js_ as follows:

```javascript
/** Gruntfile.js */
module.exports = function(grunt) {

  // Project tasks configurations
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
    
    // (C) Tasks configurations here
    frontmatter: {
        options: {
            minify: true,
            width: 200,
        },
        files: {
            'release/articles.json': ['source/articles/*.md']
        },
    }
  });

  // (L) Load here grunt plugins with tasks
  grunt.loadNpmTasks('grunt-frontmatter');

  // (T) Add here your task(s) 
  grunt.registerTask('default', [ ... ]);
};
```

It should reproduce the example shown in the overview.
