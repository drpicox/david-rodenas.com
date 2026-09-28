---
title: How this site changes
summary: The history of this site's source, read for what changes, how often and with what — the files that settle and the ones that never do, how far a change travels, and the dependencies no arrow shows.
order: 91
---

# How this site changes

[How this site is built](/projects/architecture/) draws where each file
stands. This is how often each one moves. Git keeps every commit, and every
commit says which files it changed; read over the whole history, that says
what the arrows cannot: which files settle and which never do, how far a
change travels, and which files have to change together although nothing in
the code says so.

Like the picture of how it is built, every figure here is read off the
history at every push, so it is always the commit being published. Play the
history, drag it, or press a commit on the picture of changes, and every
figure below shows the source as it stood then.

::change-player

::change-matrix

Each row is a box as it stands now, a folder of the frame or a feature,
holding its files over their whole lives, from before they moved there too;
the files that are gone have a row of their own. Each column is a commit.
Read across, the features come in one after another, each written in a
burst and then mostly left alone, while the frame under them keeps being
touched. Read down, a column shaded from top to bottom is a sweep: one
commit that changed more than thirty files at once.

## Written, then left alone

The first thing the history says is how little changes. Most files are
written once and not touched again, and a file is likeliest to change in
the commits right after the one that wrote it.

::change-settling

A file is hottest just after it is written, while what it has to do is
still being settled. Then it cools, and stays cool; and most of what
changes it after that comes with something else, a commit that brings new
files or one that sweeps through every file at once, like the one that
made each of them export a single value.

## The files that never settle

Some files never cool. They are not the young ones.

::change-hotspots

Adam Tornhill calls these hotspots (*Your Code as a Crime Scene*, 2015),
and looks at them first: whatever a file looks like, the ones that keep
changing are where the work goes. Most of these are files every feature, or
every page, passes through: the list the features are added to, which
changes because that is how the site grows; the composition root; the page
every page is written into; the terminal that takes it over in the browser.
A hotspot that no test runs is where a change most easily breaks something
nobody sees.

## Two kinds of unstable

Robert C. Martin measures how stable a component is by its place, not by
its history. Its instability is the share of its arrows that go out, what
it needs over what it needs and what needs it: 0 for a box that is needed
and needs nothing, which is hard to change, because whatever needs it may
have to change with it; 1 for a box nothing needs, which is free to. Its abstractness
is how much of it can be depended on without depending on what it does:
here, the share of its files that hold nothing but types.

He draws one against the other. A box on the line between the two corners,
the main sequence, is as abstract as its place asks. A box at the bottom
left is needed by much and concrete, hard to change with nothing abstract in
it to change instead: the zone of pain. And he says what his picture cannot
show, that only what keeps changing hurts there; so each box here is as warm
as the history says its files changed.

::change-stability

The frame stands near that corner, as a frame would: everything is built on
it, and most of it is plain code. Where the two kinds of unstable disagree,
a box that is hard to change and changes anyway, is where a change costs
most, because what needs it may have to move with it. Whether it does, the
history can say too.

## How far a change travels

When a file changes, what needs it may have to change with it, and what
needs that, and so on: the arrows are the roads a change can take. How far
they let it go is a property of the design, which MacCormack, Rusnak and
Baldwin measured as its propagation cost (2006): the share of the source a
change to one file could reach, on average. How far changes did go is
another question, and the history answers it. At every commit, each file is
counted by how far below it, in what it needs or in what that needs, the
nearest other change was, and by whether it changed too.

::change-cascade

A change does travel up the arrows, and it does not travel far. The blast
radius drawn on the picture of how this site is built, with its reach set
to all, is what a change could do, not what changes do.

## An arrow onto a type

The dashed arrows on that picture need only a type: a box that depends on
an interface, not on what implements it. That is dependency inversion, and
its promise is that a change behind the interface stays behind it. Here it
is counted instead of assumed: for each kind of arrow, how often a change
at its head came with a change at its tail.

::change-ripples

The comparison that tests the promise is the one across boxes, where an
interface is a contract between two of them. Inside a box, a type is the
box's own vocabulary, and nothing says it should be quieter than the code
beside it.

## What changes together

Two files that keep changing in the same commits need each other, whatever
the arrows say. Harald Gall, Karin Hajek and Mehdi Jazayeri called it
logical coupling (1998). A commit that changed more than thirty files is
left out: a rename across the whole source changes everything at once, and
says nothing about what needs what.

::change-together

Where there is an arrow, changing together only says it is a strong one.
The pairs worth reading are those with no arrow between them, near or far:
they share something the compiler cannot see. Among them are the page the
build writes, in node, and the terminal that takes it over in the browser.
This site's first rule is that the content is in the HTML, and this is its
price: the page and the script that reads it must agree on its markup, a
contract no import states, kept by changing both.

## With its test

A change that comes with a change to its test, in the same commit, is the
mark test-driven work leaves in a history. The history cannot say which was
written first, only that they went together.

::change-tests

The rest went to files no test imports directly: some run by a test through
another file, the shell's commands through the shell, and some by none.

## What it is not

The history starts on 7 September 2026, so it is short, and some of these
numbers are small enough to move with the next commit. A commit is the unit,
however much it changed: a one-word fix and a rewrite are one change each.
The history is the main line's, and a branch's commits arrive with the
merge that brought them. The tests are left out of every count but the
last, because a test changes when what it tests does, and would count every
change twice. And changing together is not needing each other: it is what
has to be explained.

The analyses are small programs in the source of this site, tested like the
rest of it, and they read the same history the picture of how it is built
plays.
