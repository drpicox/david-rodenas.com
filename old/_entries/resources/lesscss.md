---
title: LessCSS
image_width: 200
image_height: 90
image: /assets/images/lesscss.png
url: http://lesscss.org/
source: https://github.com/less/less.js
tags:
  - apps
  - css
  - lesscss
description: >
  LessCSS is a language designed
  to build advanced CSS3 
  visualization.
  
---
CSS3 has many options but 
it has a low degree of re-usability.
LessCSS is a language designed
to replace/complement CSS3.

LessCSS is in fact a Javascript program.
It can run in any browser, 
even in any server, if it is required.
It allows to use LessCSS directly
as native stylesheets.
LessCSS allows to define
functions, variables,
and reuse parts.
It has also connectors to be integrated
into NodeJS servers, or 
other technologies like GruntJS or Ruby.

LessCSS is compatible with CSS3,
in other words, any CSS3 code is a LessCSS
valid code.
It will makes easy to use to any designer.

```less
@base: #f938ab;

.box-shadow(@style, @c) when (iscolor(@c)) {
  box-shadow:         @style @c;
  -webkit-box-shadow: @style @c;
  -moz-box-shadow:    @style @c;
}
.box-shadow(@style, @alpha: 50%) when (isnumber(@alpha)) {
  .box-shadow(@style, rgba(0, 0, 0, @alpha));
}
.box { 
  color: saturate(@base, 5%);
  border-color: lighten(@base, 30%);
  div { .box-shadow(0 0 5px, 30%) }
}
``` 
