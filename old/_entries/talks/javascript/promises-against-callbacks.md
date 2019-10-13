---
title: "Promises against callbacks"
image: /assets/images/use-promises.jpg
image_width: 819
image_height: 624
tags:
  - talks
  - promises
  - javascript
  - teaching
  - angularcamp
description: >
  Many times I have discussions about 
  what was better, callbacks or promises.
  I need strong arguments in favor 
  or against each other.
  Finally I had and I present here,
  8 strong arguments in favor of ...
website: https://github.com/drpicox/promises-against-callbacks
---

This talk was presented in the Angular Camp of January 2016. 
It was really welcomed.

Its format is an interactive coding session in which I 
challenge the audience to realize the problems of doing
a callback implementation step by step.

Each step is saved in a different branch and can 
be easily followed.

Initial code:

```javascript
function HttpBookFactory($timeout) {
    var service = {
        get: get,//(cb)
    };
    return service;

    function get(cb) {
        console.debug('[http-book] remote get simulating...');
        $timeout(function() { 
            cb(bookMock);
            console.debug('[http-book] remote get simulated.');
        }, 3000);
    }
}
```

Initial callbacks buggy code code:

```javascript
function HttpBookFactory($timeout) {
    var service = {
        get: get,//(cb)
    };
    return service;

    function get(cb) {
        console.debug('[http-book] remote get simulating...');
        $timeout(function() { 
            cb(bookMock);
            console.debug('[http-book] remote get simulated.');
        }, 3000);
    }
}
```

Fixed callbacks code:

```javascript
function HttpBook7Factory($timeout, $exceptionHandler) {
    var service = {
        get: get,//(cb)
    };
    var savedBook;
    var cbQueue = [];
    return service;

    function get(aCb) {
        if (!aCb) {
            aCb = noop;
        }
        var cb = function(newBook) {
            try {
                aCb(newBook);
            } catch (e) {
                $exceptionHandler(e);
            }
        };
        if (savedBook) {
            $timeout(function() {
                cb(savedBook);
            });
        } else {
            cbQueue.push(cb);
            if (cbQueue.length === 1) {
                console.debug('[http-book7] remote get simulating...');
                $timeout(function() {
                    savedBook = bookMock;
                    $timeout(function() {
                        cbQueue.forEach(function(cb) {
                            cb(bookMock);
                        });
                        cbQueue.length = 0;
                    });
                    console.debug('[http-book7] remote get simulated.');
                }, 3000);
            }
        }
    }
}
```

Promises well working code:

```javascript
/* @ngInject */
function HttpBook8Factory($timeout) {
    var service = {
        get: get,//(): Promise<book>
    };
    var savedBook;
    return service;

    function get() {
        if (!savedBook) {
            console.debug('[http-book8] remote get simulating...');
            savedBook = $timeout(function() {
                console.debug('[http-book8] remote get simulated.');
                return bookMock;
            }, 3000);
        }
        return savedBook;
    }
}
```


The next time that someone tells to you if he wants to use callbacks
or promises, now you have 8 strong arguments.
