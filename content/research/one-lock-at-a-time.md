---
title: One lock at a time
summary: Making a database engine's core concurrent, one technique at a time, each with its number — including the right change that made everything twice as slow.
order: 4
---

# One lock at a time

For a year I worked inside a database engine. It was not mine — its trees,
its bitmaps, its buffer pool were there when I arrived — and I worked all
over it. This page is about one part of that year: making its core
concurrent. It ran under one global lock, and that is worse than it sounds.

## Where it started

The benchmark was a standard one: twenty queries, run by 1, 2, 4, 8 and 16
threads at once, three times each after a warm-up. Every figure on this page
is a speed-up against the same thing: the original engine, doing the same
work with one thread.

```bars
speed-up, the original engine
= 1 :: one thread alone
2 threads :: 0.62
4 threads :: 0.67
8 threads :: 0.78
```

Below one, all the way. Eight threads finished the work in a quarter more
time than one thread would have needed. A global lock does not merely fail to
help: the threads spend their time handing it to each other.

## Measure the locks, not the program

A profiler says where the time goes. It does not say who was waiting for
whom. So I put counters inside the locks themselves: how many times each was
taken, and how many of those found it already held.

The answer was not spread out. One lock, the buffer pool's, was taken 93
million times in a run, and 6.6% of those collided; every other lock sat near
zero. That redirected the whole effort. A query makes about seven trips to
the buffer pool for every operation, nearly all of them to read.

## The steps, and what each one bought

Every step lived on a branch of its own and was run through the same
benchmark, so each has a number. Speed-up with eight threads:

```bars
speed-up with eight threads, as each step went in
= 1 :: the original with one thread
where it started, one global lock :: 0.77
each thread its own temporaries :: 0.75
a shared/exclusive lock on the graph :: 0.36 !
the registry's counters made atomic :: 2.41
pin and unpin without locks :: 2.82
a lock for each line of the buffer pool :: 3.34
the same, tuned :: 4.39
```

The marked bar is the one worth the page. Letting readers into the graph
together was the right change, and it made everything twice as slow.

Why would letting readers in be slower than making them queue? Because of
what is underneath. With one exclusive lock at the door, a thread waits once,
and then finds every lock inside free: the registry's, the bitmaps', the
buffer pool's are all taken and released with nobody else asking, which costs
almost nothing. Open the door and the readers meet at every one of those
inner locks instead — about seven times an operation at the buffer pool
alone — and a thread that finds a lock taken gives up the processor and has
to be woken again. My notes of the time say it in a line: *each conflict
means losing the CPU*. One long queue had been traded for thousands of short
ones, each with a sleep in it.

A concurrent program is only as wide as its narrowest lock, and widening any
other makes the queue at that one longer. The three steps after it take the
inner locks away one at a time, and only then is what the first step earned
collected.

Which lock, too, mattered more than I expected. I timed some twenty
combinations of mutex and lock — POSIX's, spins, futexes, condition
variables, with priority for readers or without — and on the same query with
eight threads the slowest took eight times as long as the fastest. Operations that hold several bitmaps take their locks in
order of memory address, which is the whole of deadlock avoidance when you can
do it. And files are read and written by position, `pread` and `pwrite`, so
that a file needs no lock just to keep its cursor still.

The lock-free pin is the delicate one. The pin counter and the flags —
present, dirty, recent — are packed into one word and changed by
compare-and-swap: copy it, change the copy, swap only if nobody moved it. But
a pin touches two things, the line's state and which page owns the line, and
nobody promises the line is still yours between the two. So: pin, check the
owner, and undo the pin if it changed.

Before writing the lock-free pin I wrote it down: every atomic step numbered,
each with its precondition and postcondition, under the invariants of the
whole — *a pinned line is not recent; a line that is not present has no pins;
present may be set only under the lock, but cleared by anyone, atomically.* A
first attempt, without that, had been thrown away for its bugs. No test finds
the interleaving that happens once a week; an invariant does.

## Where it ended

The same benchmark, the same machine, at the end of the year:

```bars
speed-up at the end of the year
= 1 :: the original with one thread
1 thread :: 1.24
2 threads :: 1.93
4 threads :: 3.07
8 threads :: 4.39
16 threads :: 4.42
```

Faster than the original even with a single thread: a lock nobody contends
for still costs something, and most of them were gone.

From 0.78 to 4.39 at eight threads. The queries that mostly read went
further: 7.0 for the best of them, and above 6 for three more. One query of
the twenty never scaled at all: 0.83 at sixteen threads.

Sixteen threads added nothing over eight. And it was not finished when I
left: the most advanced version still had bugs open.

## The other half: tasks

Making the engine safe for threads is no use to someone who cannot write
threads. So the engine's Java interface got a small framework of tasks:
serial, parallel and for-each, with cancellation, and exceptions that arrive
where the task was started. The benchmark's queries were rewritten on it to
see whether it held.

It is the same idea as [my thesis](/research/), which it sat in the middle of, and as
[the recipe I used for Raft](/teaching/raft/) four years later: the machine
being parallel is the easy part.
