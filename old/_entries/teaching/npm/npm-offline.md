---
title: "Install npm packages offline"
tags:
  - teaching
  - npm
  - node
  - offline
date: 2016-09-01
description: >
    If you have no internet connection or 
    you have a slow and no reliable connection
    you can do npm install from cache.
snippet: |
    ```bash
    $ npm --cache-min 9999999 install
    ```
---

## Motivation

May be you are working in a plane, 
or in a train, 
just waiting in the airport,
or in a conference and wifi 
is saturated.
But you need to do an `npm install`
of packages.

The easiest trick is the following:
install packages from your cache.
Probably you already have all packages
and you do not care about updates.


## How it works?

### Shortcut in your `.bashrc`

Add an alias for offline npm support
if you are using bash (Mac or Linux), :

```bash
alias npm-offline="npm --cache-min 9999999 "
```

Use it to install as follows:

```bash
$ npm-offline install
```


## Deployment environments

Use always `--cache-min` flag to ensure faster
deployments.

```bash
alias npm="npm --cache-min 9999999 "
```


## More information

See:
- https://github.com/npm/npm/issues/2568#issuecomment-6595842
- https://github.com/nodejs/citgm/commit/0d4ae1c2eb22fe6fe0739bf423e278f10900cafc
