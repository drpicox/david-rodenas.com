---
title: OpenMP
image: 
  width: 100
  height: 100
  src: /assets/images/openmp.png
url: http://openmp.org/
description: >
  It is a directive based programming language
  eases the builing programs for
  multiprocessors and multicores.
tags:
  - high-performance
  
---
OpenMP is designed to build high performance programs,
usually with a heavy numerical load,
that need to take advantage of all resources available in a machine.

The idea behind OpenMP is to convert an existing program
(C, C++, Fortran)
into a parallel program
(which works in multiple cores and processors)
just adding few comments or directives.

```c
#pragma omp parallel
printf("Hello World!");
```

