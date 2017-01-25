---
title: "AngularJS ngClass fix ['orange', obj]"
tags:
  - contributions
  - angularjs
  - bugfix
  - ngclass
  - javascript
date: 2016-04-10
source: https://github.com/angular/angular.js/pull/14405
description: >
    This contribution fixes a bug found in ngClass
    in which, if you have a variable containing and array
    which one of the fields is an object, it has
    a different behaviour than having an 
    array in the template with one field beeing an object.
snippet: |
    ```javascript
    it('should support changing multiple classes via variable array mixed with conditionally via a map', inject(function($rootScope, $compile) {
        $rootScope.classVar = ['', {orange: true}];
        element = $compile('<div class="existing" ng-class="classVar"></div>')($rootScope);
        $rootScope.$digest();

        $rootScope.classVar[1].orange = false;
        $rootScope.$digest();

        expect(element.hasClass('orange')).toBeFalsy(); /// <<--- this fails before this patch
    }));
    ```
---

The final merge is [here](https://github.com/angular/angular.js/commit/74eb4684dce1d75c77e74fff4b98724a13438610).
