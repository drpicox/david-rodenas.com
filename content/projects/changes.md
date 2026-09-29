---
title: How this site changes
summary: The history of this site's source, read for what changes, how often and with what — the picture of the source seen through its changes, the files that never settle, how far a change travels and which files stand where changes are, and the dependencies no arrow shows.
order: 91
---

# How this site changes

[How this site is built](/projects/architecture/) draws where each file
stands. This is how often each one moves. Git keeps every commit, and every
commit says which files it changed; read over the whole history, that says
what the arrows cannot: which files settle and which never do, how far a
change travels, which files stand where changes happen, and which change
together although nothing in the code joins them.

Like the picture of how it is built, every figure here is read off the
history at every push, so it is always the commit being published. Play the
history, drag it, or press a commit on the picture of changes, and every
figure below shows the source as it stood then.

::change-player

## The picture, as it changed

The picture of how this site is built, seen through its history: each ball
as big as the commits that have changed it so far, and warm as it changed
lately, cooling by half every six commits; a warm thread between two files
that changed together twice or more, dashed where no arrow joins them. Play
the history and the heat moves: a feature being written glows and cools,
while the frame under the features warms again each time a new one is
written. Tangle it, and what changed together pulls together too. Point at a
file for what changed with it, or change the lenses for anything else the
picture of how it is built can show. Click a file, and the panel by the
picture tells its history: when it was written, every commit that changed it
up to the one shown, what it changed with, what its ground would lead one to
expect, and a link to its code.

::change-graph

## Where the changes went

::change-matrix

Each row is a box as it stands now, a folder of the frame or a feature,
holding its files over their whole lives, from before they moved there too;
the files that are gone have a row of their own. Each column is a commit.
Read across, the features come in one after another, each written in a
burst and then mostly left alone, while the frame under them keeps being
touched. Read down, a column shaded from top to bottom is a sweep: one
commit that changed more than thirty files at once. Point at a cell for
what its commit did there.

## Written, then left alone

The first thing the history says is how little changes. Most files are
written once and not touched again, and a file is likeliest to change in
the commits right after the one that wrote it.

::change-settling

A file is hottest just after it is written, while what it has to do is
still being settled. Then it cools, and stays cool.

## The files that never settle

Some files never cool. They are not the young ones.

::change-hotspots

Adam Tornhill calls a file that changes often and is also large, its lines
standing in for how complex it is, a hotspot (*Your Code as a Crime
Scene*, 2015), and starts there: the table gives both. When this page was
written, on 28 September 2026, most of the files at its top were ones every
feature, or every page, passes through: the list the features are added to,
which changes because that is how the site grows; the composition root; the
page every page is written into; the terminal that takes it over in the
browser. A hotspot that no test runs is where a change most easily breaks
something nobody sees.

## How far a change travels

When a file changes, what needs it may have to change with it, and what
needs that, and so on: the arrows are the roads a change can take. How far
they let it go is a property of the design, which MacCormack, Rusnak and
Baldwin measured as its propagation cost (2006): the share of the source a
change to one file could reach, on average. How far changes did go is
another question, which the history can only half answer: two files changed
in one commit changed together, and it cannot say which moved the other.
What it can say is how often a file changed with something it needs, near
or far. At every commit, each file is counted by how far below it, in what
it needs or in what that needs, the nearest other change was, and by
whether it changed too.

::change-cascade

Files joined by an arrow change together far more often than files that are
not, and much less often two arrows apart than one. The blast radius drawn
on the picture of how this site is built, with its reach set to all, is how
far a change could go, not how far changes went.

## Standing on moving ground

A file standing near files that change changes more often than one standing
far from them, by as much as the figure above says for each distance. Added
up over every commit, for each file, the share of files that changed where
it stood is how many changes its ground would lead one to expect: its
exposure. It says where a file stood, not what moved it. Set against what it
did:

::change-ground

Near the line, a file changed about as often as files standing where it
stood. Far above it, a file changed for reasons of its own: it grows with
every feature, or it keeps being reworked. Far below, a file stood where
files change, and did not — a list of what a feature brings, which changes
little whatever changes under it. On the picture above, colour set to
exposure shows every file's.

## Two kinds of unstable

Robert C. Martin measures how stable a component is by its place among the
others, not by its history, and he counts two kinds of coupling to do it:

- **Ca, its afferent couplings**: the files elsewhere that need something
  in it. Each may have to change when it does, so the more there are, the
  more it answers for, and the harder it is to change.
- **Ce, its efferent couplings**: its own files that need something
  elsewhere. Each may have to change when what it needs does, so the more
  there are, the more it depends, and the more often something else makes
  it change.

He counts classes, not arrows, and here a file stands for a class: a file
that needs three things elsewhere is one to Ce. His instability puts the two together, I = Ce / (Ca + Ce): 0 for a
box that is only needed, hard to change because whatever needs it may have
to change with it; 1 for a box that only needs, which nothing stops from
changing. Pick a box, and see its two couplings drawn and the sum worked
out:

::change-coupling

His rule for them is to depend in the direction of stability: an arrow
should go from a box to one more stable than itself, so that what is hard to
change never needs what is easy to change, and keeps changing. On the
picture above, colour set to stability draws every box as deep as it is
stable, and the arrows that go against the rule in red. When this was
written, on 28 September 2026, most of them left the list of features: one file, needed by one,
which by his count stands half way, and which has to point at every
feature, because putting them together is what it is for.

He also measures how abstract a box is: here, the share of its files that
hold nothing but types, which can be depended on without depending on what
anything does. And he draws the two against each other. A box on the line
between the two corners, the main sequence, is as abstract as its place
asks. A box at the bottom left is needed by much and concrete, hard to
change with nothing abstract in it to change instead: the zone of pain. And
he says what his picture cannot show, that only what keeps changing hurts
there; so each box here is as warm as the history says its files changed,
the sweeps left out.

::change-stability

The frame stands near that corner, as a frame would: everything is built on
it, and most of it is plain code. Where the two kinds of unstable disagree,
a box that is hard to change and changes anyway, is where a change costs
most, because what needs it may have to move with it.

## An arrow onto a type

The dashed arrows on the picture need only a type: a box that depends on an
interface, not on what implements it. That is dependency inversion, and its
promise is that a change to what implements the interface does not reach
those that use it: there is no arrow for it to travel, and the figure of how
far a change travels counts how seldom files change with nothing changed
below them. What an arrow onto a type can still carry is a change to the
type itself. For each kind of arrow, how often a change at its head came
with a change at its tail:

::change-ripples

An interface that grows by what its users may leave alone, a field they
need not fill, changes without them; one that breaks them changes with
them. And where one file is most of the arrows onto a type, the count is
mostly that file's, which the caption says when it is so.

## What changes together

Two files that keep changing in the same commits are tied in the history,
whatever the arrows say. Harald Gall, Karin Hajek and Mehdi Jazayeri called
it logical coupling (1998). A commit that changed more than thirty files is
left out: a rename across the whole source changes everything at once, and
says nothing about what needs what.

::change-together

Where there is an arrow, changing together says it is a strong one: it
carries. The pairs worth reading are those with no arrow between them, near
or far: they share something the compiler cannot see. Among them are the
page the build writes, in node, and the terminal that takes it over in the
browser. This site's first rule is that the content is in the HTML, and this
is its price: the page and the script that reads it must agree on its
markup, a contract no import states, kept by changing both. On the picture
above, they are the dashed threads.

## With its test

A change that comes with a change to its test, in the same commit, is the
mark test-driven work leaves in a history. The history cannot say which was
written first, only that they went together.

::change-tests

The changes to files no test imports directly are counted apart: some of
those files a test runs through another, as the shell's tests run its
commands, and some no test runs at all.

## What it is not

The history starts on 7 September 2026, so it is short, and some of these
numbers are small enough to move with the next commit. A commit is the unit,
however much it changed: a one-word fix and a rewrite are one change each.
The history is the main line's, and a branch's commits arrive with the
merge that brought them. The tests are left out of every count but the
last, because a test changes when what it tests does, and would count every
change twice. The sweeps are left out of what changes with what, and of how
often a box changed. And changing together is not needing each other: it
is what has to be explained.

The analyses are small programs in the source of this site, tested like the
rest of it, and they read the same history the picture of how it is built
plays.
