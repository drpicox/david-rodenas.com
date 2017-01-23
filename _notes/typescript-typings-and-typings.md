---
title: "Typescript typings and typings"
tags:
  - teaching
  - typescript
  - npm
  - package
  - dependencies
  - types
date: 2016-09-15
description: >
    Typings is a tool that allows to add
    type information to existing
    Javascript library so you can leverage
    on them.
snippet: |
    ```bash
    $ npm install -g typings
    $ typings init
    $ typings install --save dt~angular --global
    # Use `typings/index.d.ts` (in `tsconfig.json` or as a `///` reference). 
    ```
---

* toc
{:toc}

## Overview

Typescript is just a ES6 Javascript transpiler 
that allows to add type annotations to our sourcecode.
Type annotations allows us to have better control of our code
and increases the productivity on large teams.

Not all libraries are written in Typescript,
that means that non typescript libraries 
–plain javascript libraries– 
are not annotated and we have no extra information about types.

Most common Javascript libraries has _typings_: 
a files `.d.ts` that contains types definitions.
By adding them to our project we have full type information
exactly like as the library was written in Typescript.


## _Typings_ tools   

The [typings](https://github.com/typings/typings) 
allows to manage typings files (`.d.ts`).
It is like `npm` but for type annotation.


### Install _typings_

Install it as npm package:

```bash
$ npm install -g typings
```

### Set-up your project

Initialize typings `typings.json` file:

```bash
$ typings init
```

_Option A:_ Use the typings from your 
`tsconfig.json`:

```javascript
{
  "files": [
    "typings/index.d.ts"
  ]
}
```

_Option B:_ Include typings in your code:

```javascript
// src/main.ts
/// <reference path="../typings/index.d.ts" />
```


### Add your libraries

Install typings for your libraries:

```bash
$ typings install --save dt~jquery --global
$ typings install --save dt~angular --global
```

If does not exists, `typings` will create 
the `typings/` directory,
the `typings/index.d.ts` file,
and will add references to this file 
automatically.

You should not touch what is inside 
the `typings/` directory.


### Searching typings

You can search available definitions types as follows:

```bash
$ typings search react
Viewing 20 of 107

NAME                              SOURCE HOMEPAGE                                                      DESCRIPTION VERSIONS UPDATED                 
griddle-react                     npm    https://www.npmjs.com/package/griddle-react                               2        2016-04-13T18:36:51.000Z
mobservable-react                 dt     https://github.com/mweststrate/mobservable-react                          1        2016-03-16T15:55:26.000Z
npm-react-notification-system     npm    https://www.npmjs.com/package/npm-react-notification-system               1        2016-06-13T15:18:07.000Z
react                             npm    https://www.npmjs.com/package/react                                       1        2016-06-01T17:52:40.000Z
react                             dt     http://facebook.github.io/react/                                          2        2016-08-29T19:10:40.000Z
react-addons-create-fragment      dt     http://facebook.github.io/react/                                          1        2016-07-09T04:46:14.000Z
react-addons-css-transition-group dt     http://facebook.github.io/react/                                          1        2016-03-16T15:55:26.000Z
react-addons-linked-state-mixin   dt     http://facebook.github.io/react/                                          1        2016-03-16T15:55:26.000Z
react-addons-perf                 dt     http://facebook.github.io/react/                                          1        2016-06-19T03:19:33.000Z
react-addons-pure-render-mixin    dt     http://facebook.github.io/react/                                          1        2016-03-16T15:55:26.000Z
react-addons-shallow-compare      dt     http://facebook.github.io/react/                                          1        2016-07-09T04:46:14.000Z
react-addons-test-utils           dt     http://facebook.github.io/react/                                          1        2016-04-27T03:56:38.000Z
react-addons-transition-group     dt     http://facebook.github.io/react/                                          1        2016-07-01T00:13:52.000Z
react-addons-update               npm    https://www.npmjs.com/package/react-addons-update                         1        2016-03-24T04:43:46.000Z
react-addons-update               dt     http://facebook.github.io/react/                                          1        2016-03-16T15:55:26.000Z
react-autosuggest                 dt     http://react-autosuggest.js.org/                                          1        2016-08-29T14:27:41.000Z
react-big-calendar                dt     https://github.com/intljusticemission/react-big-calendar                  1        2016-07-20T06:35:54.000Z
react-bootstrap                   dt     https://github.com/react-bootstrap/react-bootstrap                        1        2016-08-06T07:24:14.000Z
react-bootstrap-daterangepicker   dt     https://github.com/skratchdot/react-bootstrap-daterangepicker             1        2016-07-01T06:17:00.000Z
react-bootstrap-table             dt     https://github.com/AllenFang/react-bootstrap-table                        1        2016-07-26T19:39:56.000Z
```

Note that source `dt` means that when installing you should prepend `dt~` to the package name.
The source `npm` means that typings are available along the package in `npm`.


### Working with `git`

`typings` creates the `typings/` directory
in the root of your project and registers
dependencies into `typings.json`.
It is like `npm` which creates `node_modules`
and registers dependencies into `package.json`.

You should add `typings.json` to your git repository
and add `typings/` directory to `.gitignore.
Contents of `typings/` should not be pushed to the
repository.

When you checkout the project, or typings changes in
the repository, you should execute `typings install`
and it will download and create the `typings/`
directory automatically. 


### Typings and npm

The `typings` tools is designed to work with node.
By adding `typings` field to the `package.json`:

```javascript
{ 
  "typings": "./lib/foo.d.ts"
}
```

It will try to load it.


### More information

See:
- https://github.com/typings/typings
- https://www.typescriptlang.org/docs/handbook/typings-for-npm-packages.html
