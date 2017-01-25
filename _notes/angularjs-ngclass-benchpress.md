---
title: "AngularJS ngClass benchpress"
tags:
  - contributions
  - angularjs
  - performance
  - benchpress
  - ngclass
  - javascript
date: 2016-10-10
source: https://github.com/angular/angular.js/pull/15243
description: >
    This contribution adds a benchpress suitcase
    to AngularJS performance test
    to evaluate the impact in the performance
    in changes in `ngClass`.
snippet: |
    ```javascript
    benchmarkSteps.push({
      name: '$apply',
      fn: function() {
        $scope.$apply();
      }
    });
    ```
---

In [PR to improve ngClass performance](../angularjs-ngclass-performance)
I have claimed that in some conditions the ngClass
can degrade severely the performance of an AngularJS 
but I have presented no more proof than deduction.

With this PR I contribute with a new suite case of
performance test to evaluate the impact of changes in ngClass
in the performance of AngularJS applications.

I have used almost real examples based in templates of
public applications and bootstrap templates.

Results have proof that original ngClass has some cases of
poor performance results, and the new implementation
solved all of them making the use of ngClass always well optimized.
