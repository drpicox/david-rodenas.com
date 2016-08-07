---
layout: post
categories: angular
title: "drpx-transcludeto: multi-transclude"
subtitle: "Improve your directives modularity"
tags:
  - angular
  - modules
date: 2015-05-06
abstract: >
    Angular lets you to transclude html templates into your directives,
    in other words, parametrize a directive with one template.
    Unfortunately, angular is limited by one single translcussion.
    Here I present a small module that allows multiple transclussion,
    it allows you to create directives like lists with custom header
    items and footers, higly configurable dialogs, ...
snippet: |
    ```html
    <list-pager list="vm.people">
        <h1 target-to="header">People</h1>
        <person-detail person="$container.item" target-to="item"></person-detail>
        <div target-to="footer">
            <button ng-click="add()">Add</button>
        </div>
    </list-pager>
    ```
source: https://github.com/drpicox/drpx-transcludeto
append: "/drpx-transcludeto/README.md"
hideTitle: true
---


