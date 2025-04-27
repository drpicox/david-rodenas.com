---
title: "AngularJS ngClass performance boost"
tags:
  - contributions
  - angularjs
  - performance
  - benchmark
user: "drpicox"
---

# AngularJS ngClass performance boost

- **source**: https://github.com/angular/angular.js/pull/14404

```javascript
it('should not copy verylargeobject', inject(function($rootScope, $compile) {
  var getProp = jasmine.createSpy('getProp');
  var verylargeobject = {};
  Object.defineProperty(verylargeobject, 'prop', {
    get: getProp,
    enumerable: true
  });
  element = $compile('<div ng-class="{foo: verylargeobject}"></div>')($rootScope);
  $rootScope.verylargeobject = verylargeobject;
  $rootScope.$digest();

  expect(getProp).not.toHaveBeenCalled();
}));
```

Although this PR was not accepted as it,
@gkalpak (part of AngularJS core ) 
used it as base for [full ngClass refactor](https://github.com/angular/angular.js/commit/1d3b65adc2c22ff662159ef910089cf10d1edb7b).
As he explains:

>  In large based on #14404. Kudos to @drpicox for the initial idea and a big part
>  of the implementation.

The reason behind of being implemented by him was to refactor everything
quickly with multiple commits avoiding the PR proposal/accept delays.

Before this PR there was some tricks that have to be done in the 
ngClass expressions to make sure that they are fast enough:

```javascript
    <i class="icon" ng-class="{friendly: !!user.friends, male: user.isMale}">...</i>
    <td ng-class="todo.completed && 'completed'">...</td>
```

After this PR, the performances is good not matters the syntax:

```javascript
    <i class="icon" ng-class="{friendly: user.friends, male: user.isMale}">...</i>
    <td ng-class="{completed: todo.completed}">...</td>
```

I have also created a benchmark with benchpress to make sure that performance improvements are good. For more details, see [ngClass Performance with Large Objects](/angularjs/ngclass-performance-large-objects).