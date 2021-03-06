---
title: "grunt-frontmatter: extracting yaml"
tags:
  - grunt-frontmatter
  - front-matter
  - projects
  - node
  - grunt
  - yaml
date: 2015-02-09
description: >
  Published a grunt task able to extract YAML front-matter
  from files and integrate all into a single JSON file.
snippet: |
  ```yaml
  ---
  layout: post
  title: Blogging Lika a Hacker
  ---
  ```
---

* Will be replaced with the ToC
{:toc}


Here I present a new grunt task (yep, another grunt task), 
the idea of these task is to extract YAML front-matter from files 
and put them all into one single JSON file.

For long time I have been using [grunt-markdown-to-json](https://www.npmjs.com/package/grunt-markdown-to-json) 
in my developments (two examples: one was this web page, another is [Wenode](../notes/wenode)). 
The idea of using this grunt task is to generate JSON data to index files 
and their metadata so it can be loaded statically by a web app. 
Example:

```
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
```

so it generates a new file like this:

    .
    ├── Gruntfile.coffee
    ├── package.json
    ├── source
    └── release
        └── articles.json        <--


## What is front-matter?

Last few years [front-matter](../notes/front-matter) is becoming more popular (specially thanks to tools like Jekyll and Assemble). Front-matter is a ipso-facto standard to add metadata to a text file by using [YAML](http://www.yaml.org/). An example of front-matter would be the following markdown:

```markdown
  ---
  title: Example
  tags:
      - example
      - has_frontmatter
  ---
  # This is an Example

  And metadata is above
```

In this case, the metadata for this text file is the following JSON:

```json
{
    "title": "Example",
    "tags": ["example", "has_frontmatter"]
}
```

All metadata is enclosed between an initial `---\n` and the following `---\n`. Apps and processes reading such text files must be aware of this special heading and they may skip it.


## Status of "grunt-markdown-to-json"

The problem of _grunt-markdown-to-json_ was that it just is a wrapper for _npm_ _markdown-to-json_ . I have found two problems repeateadly since the first time that I have used it:

- It is unable to create new files if they are required: so, for example, if you remove _release_ directory during clean, and then execute the m2j task, the task fails (this is because it is not using grunt tools),

- It does not accept markdowns with `---` (the <hr> symbol): I usually do not use them but they are part of the markdown definition, so it sort of unexpected. After analysing it, it turns out that it does not allows to use `---` because it internally is using _npm_ _js-yaml_ and this package believes that there are two front-matters inside the same file, and it fails.

Another issue, but not as relevant, is that it has no normalized name, so, although the package is called _grunt-markdown-to-json_ , the grunt task is called _m2j_ . It makes it use a little bit confusing, but most important, tools like [jit-grunt](https://www.npmjs.com/package/jit-grunt) require manual configuration.


## New package "grunt-frontmatter"

I have built [grunt-frontmatter](../notes/grunt-frontmatter), it has almost the same interface that has _grunt-markdown-to-json_ but it assumes nothing about files except that they have a front-matter. Potentially it would work with any text file. 

