---
title: A test is an example
summary: One of the first essays I published was about this — a test that reads like the documentation of what it tests survives a refactor, and tests that look inside can pass over a bug. The same tests, run here against three dispatchers.
order: 2
---

# A test  
is an example  
of use.

One of the first essays I published, in 2018, has an example that begins with
two tests of a dispatcher that pass, cover every line of it, and say almost
nothing: they look at its `_queue`, a part meant to be private. It ends with
one test written the way the dispatcher would be documented — add a listener,
deliver a message, the listener gets it.

Here are the three, run against a dispatcher they all pass, against the same
dispatcher refactored, and against one with a bug in it. Choose one:

::tests-as-examples

Refactored, nothing a user of the dispatcher could see has changed, and the
two tests that looked inside break anyway. With the bug, both of them stay
green: each checks its own half against `_queue`, and the bug is where the
halves meet. Only the one that reads like documentation is right both times.
In Kent Beck's words: [“Tests should be coupled to the behavior of code and
decoupled from the structure of code.”](https://x.com/KentBeck/status/1182714083230904320)

So I write tests the way the thing would be explained to someone about to
use it, and a test is also the example that someone can copy. Three of the
rules I ended that essay with still hold:

- “Never use ‘private’ properties in testing code.”
- “Test functionalities, not functions/methods.”
- “Verify that testing code should be copy-pasteable to new production code.”

The essay is [Why you should start writing tests as they were
documentation](https://medium.com/p/73a356df3523).
