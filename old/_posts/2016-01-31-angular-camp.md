---
title: "AngularCamp talks"
tags:
  - talks
  - teaching
  - angularjs
date: 2016-01-31
description: >
    AngularCamp take place at January 30-31 of 2016
    in Barcelona. 
    During the event, I proposed few talks, and I
    did them. 
    In this post I collect the slides and resources
    involved in those talks.
snippet: |
    ```javascript
    console.debug('[http-book6] remote get simulating...');
    $timeout(function() {
        savedBook = bookMock;
        $timeout(function() {
            cbQueue.forEach(function(cb) {
                cb(bookMock);
            });
        });
        console.debug('[http-book6] remote get simulated.');
    }, 3000);
    ```
---

The Angular Camp official web page is:

- http://angularcamp.org/

### Promises - Arguments against detractors

In this repo, I present, step by step, whichs problems appears
when we work with promises, and at the end, I show how we can
do the same with promises.

- https://github.com/drpicox/promises-against-callbacks


### MVC - Model, the great forgotten

In this presentation, I show step by step the construction
of an Angular application, and which role plays the model.
I show how the model is the _source of truth_ and takes a
vital role to ensure the consistency of all views at any 
moment.

- [MVC - Model, the great forgotten](/posts/resources/Mvc - Model, the great forgotten.pdf)
