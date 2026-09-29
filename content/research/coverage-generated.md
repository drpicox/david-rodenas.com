---
title: Coverage, generated
summary: 2023. A program that knows nothing of what the code is for wrote the tests, and reached 85% code coverage, more than most companies ask for. Why coverage helps the programmer, and says nothing to a manager.
order: 6
---

# Coverage, generated

Code coverage counts the lines the tests run. For a programmer it is a good
question to ask: a line no test runs is a line no test checks, and a change
there breaks something nobody sees. It also became a target. Many companies
ask for 80% before code can ship, and that second use is the one this
experiment was about.

A test can run a line without checking it. `addition(3, 4)` covers all of
`return a + b`, and passes just as well once it has become `a - b`. In a small
program that shows; in a large one, nobody finds the test that asserts
nothing. And covering code takes two rules only: run every method, and run
every branch. Neither needs to know what the code is for. Allen Holub had put
it that way: tests that call every method with random arguments would reach
the 80% so many companies ask for.

So I wrote them. The first version, in Java, made an instance of every class
with a public constructor that took no arguments, and called every method
that took none: 11%. It became a final-degree project, which Gerard Torrent
took on: instead of one test that walks through everything, a generator that
writes a test for every method and its arguments, and builds whatever objects
those need. Step by step, coverage went:

```bars
code coverage, by tests that know nothing of the business
= 80 :: what many companies ask for
my first version :: 11 | 11%
every constructor called, with nulls :: 20 | 20%
the public methods that return nothing :: 23 | 23%
every public method :: 50 | 50%
every method, the private ones too :: 50 | 50%
the arguments built, not null :: 65 | 65%
what those arguments need, built too :: 69 | 69%
three values for every argument :: 69 | 69%
Spring building whatever it can :: 85 ! | 85%
```

Calling private methods from a test is a bad habit; it was tried only to see
what it would add, and it added nothing.

Eighty-five per cent, without a line that knows what the program is for, and
without any AI. People under a deadline meet a coverage target the same way.
A developer I met at a meetup told me how his team, which had no tests, had
to reach the 60% the FDA required: they started with tests worth having,
and ended writing whatever raised the number, for three months. And I once
opened a team's tests, written to meet their company's 80%, broke the code on
purpose, and watched them pass.

So coverage is for the programmer: where it is low, there is code no test
runs, and that is worth a look, as
[Martin Fowler has long said](https://www.martinfowler.com/bliki/TestCoverage.html).
As a number for a manager to ask for, it measures only that the code was run.
What says a test is worth something is seeing it fail first, which writing it
first gives, and checking something the business needs.

The whole story is on Medium:
[*Confirmed: Code Coverage Is a Useless Management Metric*](https://medium.com/@drpicox/confirmed-code-coverage-is-a-useless-management-metric-35afa05e8549),
8 July 2023.
