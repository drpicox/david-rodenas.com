---
title: "grunt-frontmatter now supports multiple directories"
tags:
  - grunt-frontmatter
  - front-matter
  - projects
  - node
  - grunt
  - yaml
date: 2017-01-09
description: >
  Almost two years ago I published grunt-frontmatter,
  with minimal support for generating JSON from 
  YAML front-matter.
  Now I'm releasing a new version that supports
  files into multiple directories.
snippet: |
  ```javascript
  frontmatter: {
    options: {
      dirname: true,
    },
    files: {
        'all.json': ['**/*.md'],
    }
  }
  ---
  ```
---

An example can be found here:
https://github.com/drpicox/grunt-frontmatter/tree/master/examples/nested

Setup:

```bash
$ cd examples/nested
$ npm install
```

Run:

```bash
$npm run example
```

It converts from:

    .
    ├── about
    │   └── index.md  <-------
    ├── home
    │   └── index.md  <-------
    ├── Gruntfile.js
    └── package.json

to:

    .
    ├── about
    │   └── index.md
    ├── data.json     <-------
    ├── home
    │   └── index.md
    ├── Gruntfile.js
    └── package.json

Generated `data.json` contents are:

```json
{
  "about/index": {
    "title": "About",
    "preview": "About this page..",
    "basename": "index",
    "dirname": "about",
    "md5": "2a5f5e1e1f703c2869e0bacb1a8f6b18"
  },
  "home/index": {
    "title": "Home",
    "preview": "You can also check about..",
    "basename": "index",
    "dirname": "home",
    "md5": "9fffc6615b2660f1ff7c77f759e7efd7"
  }
}
```
