---
title: A test suite is a language
summary: Thousands of plain-sentence test steps, each inventing its own way to say an old thing — treated as a problem of language design, with a grammar, a cost model and a ratchet so the debt can only go down.
order: 2
---

# A test suite  
is a language.

A product whose behaviour is specified in plain sentences, in Gherkin:
hundreds of files, thousands of scenarios, and 3,813 different step phrases
served by 819 step definitions. Every new test found a new way to say an old
thing, and every new way needed a pattern of its own.

The usual fix is a style guide and code review. A style guide is a rule
written down.

## A grammar instead

So I treated the suite as what it is, a language, and designed it as one:

- a generative grammar for the step phrases, with closed vocabularies and
  seven invariants every phrase must keep;
- a measured cost model of *altitude*: the same assertion, made at a
  different level of the system, can cost fifteen times as much;
- a migration map for every step definition there was;
- and two guards in CI, one with a baseline per file that can only move one
  way — a ratchet, so the test debt can only go down.

## Twice

The same idea, four years earlier, in a university course: specifications
written in plain English and [compiled into tests](/teaching/software-lab/)
for the server and the client, and a grader that replayed every commit to see
whether the tests really came first.

And in public, the smallest version of it: [Gherkin
Genie](https://github.com/drpicox/gherkin-genie), a Gherkin engine with no
regular expressions in it at all.
