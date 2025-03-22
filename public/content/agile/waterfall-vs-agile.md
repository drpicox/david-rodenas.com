---
title: Waterfall Vs Agile
user: "drpicox"
tags:
  - testing
  - agile
---

# Waterfall Vs Agile

Waterfall was defined as a way to improve how the
software were developed. The vision was simple: copy the same strategies
that worked so well in the industry previously. Software
development working as a factory in which there was a product, documents, moving down
through different stages. It was, with a bit of simplification:

1. Start with requirements: to define the final result, the first stage is
   capturing precisely those requirements.
2. Create the designs: once you know what to do, then you can capture all those
   requirements in a precise design able to accommodate all the functionalities.
3. Implement the code: this stage is following the instructions and create the
   code.
4. Verification: before releasing the product, get the requirements and get the
   design, and verify that the code and the resulting product satisfies with the
   requirements. Each stage had its dedicated roles and specialized
   professionals, and each stage has a result of some document or specification.

This is the overview:

```
Requirements
    ↓
  Design
    ↓
Implementation
    ↓
Verification
```

Agile turned out to be the opposite. In Agile we assume that we do not know the
final result that we want before begin, it relays in quick adaptation and
methodical research to know that the product is the correct one. In Agile:

1. We begin with an idea: from this idea we write the tests, first in human
   language, then in code.
2. We start to iterate and create the code: while we create the code of the
   tests, we also create the implementation.
3. Then it comes the design: the design is created after the code, we refactor
   to change the code and adapt it to the best design, at each moment. We do it
   continuously as part of the red-green-refactor loop.
4. We run the experiment: because we cannot be sure that the product is the
   correct one, we use it to run an experiment in the market, so we can see that
   everything works.

Agile does not assume a required set of skills for each step, or neither we use
the test to verify the final result. The objective of the Agile is getting the
best value for each iteration, and for that, we need iterations to be as short
as possible. We keep the red-green-refactor loop under 30 seconds, but we want
to keep the requirement definition loop as short as possible.

```
  Tests  ←  Ideas
    ↓
   Code
    ↓
  Design
    ↓
Experiment
```
