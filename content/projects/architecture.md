---
title: How this site is built
summary: The source of this site as boxes and arrows, commit by commit — the program an AI wrote, and the rules it is held to.
order: 90
---

# How this site is built

The code of this site is written by an AI — Claude, in Claude Code — from
what I ask of it. I say what the site is and how it should be made; it
writes the program, and the tests.

The picture is that program. Every ball is a file, every box a folder of the
frame or a feature, and every arrow a box that needs another. It is read from
the source by the TypeScript compiler, at every commit that changed it. Play
it and watch it grow; tangle it to see the same files with nobody saying
where anything goes, and untangle it again. Put the tests in, and every file
with something in it to run that no test imports directly is drawn as a
ring.

A ball is as big as the number of files that need it, so the hotspots — the
files a change reaches first — stand out; it can be as big as what it needs,
as its lines, or as the commits that have changed it so far, which grows as
the history plays and stops where a file settles. Every file a commit
changes rings as it comes. Point at a file, and its own arrows come out: in
blue what it needs, in orange what needs it. Give them a reach of two, three
or all, and they go on from there: the blast radius of a change, in both
directions. Click a file, a box or a commit, and it opens on
[GitHub](https://github.com/drpicox/david-rodenas.com) as it stood then.

::architecture

How often each file changes, how far a change travels, and which files
change together with no arrow between them is the other half of this
picture: [how this site changes](/projects/changes/).

## The arrows point one way

A rule written in a document is a rule that can be missed, by a person or by
an AI. So the rules of this code are not in a document: they are tests it has
to pass. `architecture.test.ts` reads the same graph this picture draws, and
fails when

- a file outside a folder named `browser/` touches the page,
- the frame imports a feature,
- two boxes need each other round in a circle,
- a file exports more than one value,
- a feature is missing from the diagrams in `ARCHITECTURE.md`.

The dashed arrows need only a type: a box that depends on an interface, not
on what implements it. That is dependency inversion, and it is what lets a
feature be removed by removing its folder.

## 8 September 2026

On its first day the source was sorted by kind of file: a `core` and a `ui`.
On the second it was sorted by what the site is — a frame, and the features
standing in it — in one commit: *The folders say what the site is, not what
kind of file each one holds*. Drag the slider back to it and watch the files
cross.
