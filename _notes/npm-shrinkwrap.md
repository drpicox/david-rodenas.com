---
title: "Installing node packages in production environments"
tags:
  - teaching
  - npm
  - package
  - dependencies
  - production
date: 2016-09-21
description: >
    Production environments must be stable and replicable.
    Using npm-shrinkwrap we can ensure that installed 
    versions of our dependencies are exactly the ones
    that we expect.
snippet: |
    ```bash
    $ npm shrinkwrap
    $ npm install
    ```
---

## Motivation

Each time that we execute `npm install` 
it looks for compatible versions and installs them.
If an update is available for the given semver expression
it will look for the newer version and install it.

Usually newer minor or patch versions are compatible with
the existing ones, but new bugs or even breaking changes
can make our code break. 

We can try to fix versions to be installed. 
For example: instead of writing 
`"tsify": "^1.0.5"`
we can write
`"tsify": "1.0.5"`,
it will install the exact version 1.0.5, but,
usually the installed libraries have dependencies
in other libraries, they use compatible version nomenclatures
and we cannot change it. 
For example, _tsify_ requires `"babelify": "^7.2.0"`.

This is the reason why we need to use _npm-shrinkwrap_ in our projects.
It will create a file named `npm-shrinkwrap.json` 
that we can push to our git and it contains all explicit dependencies.


## How it works?

### Setup your project

Make sure that you have a clean node_modules:

```bash
$ rm -fr node_modules/
$ npm install
```

Check that you application or service is working well.

Create the `npm-shrinkwrap.json` file:

```bash
$ npm shrinkwrap
```

Push the `npm-shrinkwrap.json` file to your repository.

```bash
$ git add npm-shrinkwrap.json
$ git commit
$ git push
```


### Install dependencies 

Create a clone of the branch that you want to install:

```bash
# Your commands here
$ git clone https://github.com/drpicox/david-rodenas.com --branch master --single-branch
$ cd david-rodenas.com
```

Execute npm install:

```bash
$ npm install
```

Now you can build or run your application service 
knowing that you have the exact same version of all dependencies.


### Adding new dependencies

Install your dependency with --save or --save-dev and
_npm-shrinkwrap.json_ will be updated.

```bash
$ npm install --save lodash
$ git add package.json npm-shrinkwrap.json
$ git commit
$ git push
```

## Other recommendations

It is also recommended to use the offline install for production
environments, see [npm-offline](./npm-offline).


## More information

See:
- https://github.com/drpicox/david-rodenas.com/blob/release/v5/npm-shrinkwrap.json
- https://docs.npmjs.com/cli/shrinkwrap
