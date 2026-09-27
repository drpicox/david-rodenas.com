---
title: Rules into code
summary: When a rule matters, I turn it into code instead of a guide, so it holds for a person and for an agent alike. What that looks like in industry — the mechanism, not the client.
order: 35
---

# When a rule matters,  
I turn it into code  
instead of a guide.

A guide can go unread. A type, a grammar, a test or an allowlist cannot be
skipped. And because the check lives in the code, it does not matter who
writes the change — a person or an AI agent: it holds for both.

These pages are about the mechanism, not the client: no names of
repositories, products, tickets or customers.

- [A mask that cannot drift from its audit](/work/payment-masking/)  
  Card data inside free text, and one pattern that both hides it and records it.
- [A test suite is a language](/work/test-grammar/)  
  A grammar for 3,813 step phrases, and a ratchet so test debt can only go down.
- [An agent reliable by construction](/work/reliable-agent/)  
  Tool calls checked against the program's own types, and evaluations no model can make flaky.

## Changes without surprises

A plugin platform that several teams build on: 22 npm packages, 396 releases
and 32 breaking changes in nine years, none of them by surprise. A change
ships in two steps — deprecated with a warning, removed after a dated window.
How much the old way is still used says which team to help first. And an
allowlist keeps the code that exists working with the old API, while new code
can only use the new one.

## Measured before touched

- A flight-search screen that froze for more than a minute: the cause was in
  another team's code, and it was fixed there.
- A CI test job from about eighteen minutes to about four, argued with a year
  of data.
- A tenfold slowdown of the tests after a design-system migration, isolated
  with a control experiment.
- [Two performance changes in the AngularJS compiler](/open-source/angularjs/),
  still in its last release.
- [A database engine's buffer pool without locks](/research/one-lock-at-a-time/),
  on a research branch.

## And this site

It follows the same rule: its architecture is a set of tests, and [its source
is drawn commit by commit](/projects/architecture/). What I teach is on
[teaching](/teaching/); what I think about it, every Saturday, on
[essays](/essays/).
