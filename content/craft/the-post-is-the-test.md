---
title: The post is the test
summary: My students got stuck on the regular expressions that tie each step of a test to its code, so a step's sentence became the code's name, and a post became the test. The idea, running, and where it went after the course.
order: 1
---

# A sentence is a step.  
The post is the test.

A behaviour test written in plain sentences needs, for every sentence, a
piece of code that knows what to do with it, and the usual way to find that
piece is a regular expression written to match the sentence. That is where my
students got stuck: on the expressions, and on naming the functions behind
the steps.

So the course's platform stopped matching sentences, and read them instead.
Every word goes into the name of a method; a quoted string becomes an
argument and an `S` in the name, a number an argument and an `N`. There is
nothing to match, because the sentence is the name. The post is the test,
and each of its sentences a step: write one, a step a line, and see what it
becomes:

::step-names

The test is the same for the server and for the client, one call a step,
with the step's sentence beside it — so a line that fails says, in the student's own
words, what did not happen. What is left to write are the methods at the
bottom, and writing them is the work. The rest of that course is in [the post
comes first](/teaching/software-lab/).

## Where it went

The idea went through several versions in the course, and then out of it, as
[Gherkin Genie](https://github.com/drpicox/gherkin-genie): the same reading of
sentences, for Gherkin and for any test runner, with no regular expressions at
all. A missing step is printed as the method to paste in, already named.
Later it was adapted once more, for the tests of a product at work.
