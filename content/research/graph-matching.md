---
title: Graph matching on a desktop
summary: Universitat Rovira i Virgili, 2009–2011. Two computer-vision algorithms rewritten for CUDA and OpenMP on an eighteen-watt desktop: an hour and a quarter became under two minutes, without changing the result by a bit.
order: 2
---

# Graph matching on a desktop

The second half of [the thesis](/research/), at the Universitat Rovira i
Virgili between 2009 and 2011: the [tools of the first
half](/research/parallel-tools/), put to work on a problem that needed them.

Computer vision likes to describe things as graphs: a house is a roof, a
door, two windows, and how they touch. Comparing two graphs exactly is
exponential in their size, and even the good approximations were too slow to
use outside a laboratory.

I took two of those algorithms, graduated assignment for a pair of graphs and
for the common labelling of many, and rewrote them for what a desktop had
become: a multi-core processor beside a graphics card. The method is what the
first half had taught. Transform the equations, not the code — splitting,
tiling and reordering loops in a notation close to the mathematics — so that
the program falls into the same two levels of parallelism, and the result
does not change by a single bit.

The machine was chosen for what it did not have: an Intel Atom with two
cores, the kind put in netbooks, and the small graphics chip sold beside it.
Eighteen watts between them.

::graph-matching-runs

Matching every pair of 150 graphs of 24 vertices took one thread an hour and
a quarter. OpenMP on the same two cores brought it to twenty minutes; the
graphics chip, to under two. The common labelling of fifty such graphs went
from twenty hours to thirty-nine minutes. And the larger the graphs, the
larger the gain — sixteen, twenty-two, forty times — which is the right way
round: it is the large ones that were out of reach.

On the largest graphs tried, 512 vertices, the thesis reports the parallel
version 366 times faster than the serial one, whose run at 1,024 vertices was
not attempted: it was estimated at forty-two days.

That is close to real time, on hardware a robot or a fingerprint reader could
carry, which is what the algorithms had been waiting for.

Both are first-author papers in Springer's Lecture Notes in Computer Science:
[IbPRIA 2011](https://doi.org/10.1007/978-3-642-21257-4_63) and
[GbR 2011](https://doi.org/10.1007/978-3-642-20844-7_14).
