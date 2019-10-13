---
title: "Angular providers"
tags:
  - angularjs-provider
  - teaching
  - angularjs
date: 2015-05-08
description: >
    One of the most difficult parts to AngularJS newcomers 
    is now in Teaching section.
snippet: |
    ```javascript
    function Logger() {
        this.log = function(msg) { console.log(msg); };
    }
    // ..choose..
    module.value('logger', new Logger());
    // ..or..
    module.service('logger', Logger);
    // ..or..
    module.factory('logger', function() { return new Logger(); });
    // ..or..
    module.provider('logger', function() {
        this.$get = function() { return new Logger(); };
    });
    ```
---
