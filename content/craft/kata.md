---
title: The kata, one commit at a time
summary: Robert C. Martin's Bowling Game Kata in the commits a student makes, each one run here as you reach it — the rhythm of test, code and clean, the step back to green before the design changes, and the one step I added.
order: 1
---

# The kata,  
one commit  
at a time.

Robert C. Martin wrote the Bowling Game Kata to be repeated like a form, until
its steps come without thinking. This is it in JavaScript, as I taught it,
split into the commits a student makes: each one a single move — a test, the
code it asks for, or a clean-up — and the bar says whether the tests passed. Every
commit is run here, in the page, as you reach it: walk it with the arrows, or
jump from the strip. Where one of my essays says something about a step, it is
beside it, with a link to where I say it at length.

::bowling-kata

## What to watch

**The rhythm.** Red, then green, then as many clean steps as it takes, all of
them green. The strip at the top is that rhythm, seen before a line of it is
read.

**Refactor only after it works.** The duplication in the tests is marked at
commit 8, and it waits: nothing is cleaned while a test fails. At 17 the spare
test fails, and the design is wrong for it — the slide says so. So the next
commit sets the test aside, and the design changes with every test passing.
The test comes back, is set aside once more when the design is still wrong,
and passes at 28.

**Add new code before removing the old.** Commit 10 creates a game for every
test, and ignores it; only then do 11 and 12 take the old one out, one test at
a time. Commits 19 to 23 do the same to the score itself, in [five
steps](#five-steps-and-the-code-works-after-each-one) of their own.

**A test seen failing once.** The perfect game passes the moment it is
written. A test that has never failed has not yet shown it can: so at commit
40 it expects `"fail"`, to see it go red and show the 300 it really got, and
at 41 it gets its 300 back. That step is the one I added; I wrote why in [Don't Trust
Tests](https://medium.com/p/6813582074f3). Since then I do it with every test
that passes without asking for any code.

What else the kata taught me, I wrote down as I found it: its lessons on
refactoring, [part one](https://medium.com/p/90b110a2ad17) and [part
two](https://medium.com/p/1d28b3a78b08), then [what to
test](https://medium.com/p/fc771d5e39e8) and [how to
design](https://medium.com/p/a37d8d11be9c).

## Five steps, and the code works after each one

Probably the best thing the kata teaches, and it works on code of any size:
how to change the way something is kept without ever breaking it. First name
the parts — what keeps the data, what writes it, what reads it. Then add the
new beside the old, write to both, read from the new, stop writing the old,
and remove it:

::kata-five-steps

After each step the code works again, so each one could be committed and
merged: a large change becomes many small ones, without stopping delivery.
Elsewhere this shape is called a [parallel
change](https://martinfowler.com/bliki/ParallelChange.html). I wrote the
technique down in [Refactor Lessons Learned From The Bowling Game Kata
(2/2)](https://medium.com/p/1d28b3a78b08).

## Whose it is

The kata, its steps and the notes on its slides are Robert C. Martin's, from
his slides of 2005. Mine are the JavaScript, the commits a student makes one
by one, each labelled with its move, and the perfect game made to fail. The
slides it follows are on [the kata's page](/teaching/kata/), with a version in
Java.
