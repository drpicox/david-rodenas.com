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

The picture can be looked through lenses. A ball can be as big as the files
that need it — the hotspots, the files a change reaches first — or as the
files it needs; as all the files a change to it could reach, near or far; as
much as it stands between the others; as the commits that have changed it so
far, which grows as the history plays and stops where a file settles; or as
its lines. It can be coloured by how lately it changed, by how often files
standing where it stands changed, or by how stable its box is, with the
arrows that go against stability in red. Threads can be drawn between the
files that changed together, dashed where no arrow joins them; tangled, they
pull the files together too. Every file a commit changes rings as it comes.

Point at a file, and what it is asked to show comes out, said on the line
over the picture so that no word covers an arrow: its own arrows, what it
needs and what needs it, each in the colour the line keys it to, one arrow
out or as far as they go — all a change to it could reach, and all whose
change could reach it; the group the arrows gather it into; or the files
that changed with it. Click a file or a box, and the panel by the picture
tells of it at the commit shown: where a file stands in the network, what
its history has been and what it changed with; a box's couplings, with the
sum worked out. Every file and box it names leads to its own details, and a
link leads to the code on
[GitHub](https://github.com/drpicox/david-rodenas.com) as it stood then. With
nothing chosen, the panel tells of the network as a whole.

::architecture

How often each file changes, how far a change travels, and which files
change together with no arrow between them is the other half of this
picture: [how this site changes](/projects/changes/).

## What the tangle shows

Tangled, with no boxes, the files arrange themselves by the arrows alone,
and structures appear: knots of files that need one another, and files that
everything seems to pass through. Both can be counted, and the figures here
follow the picture's history as it plays.

**The network.** Read as network science reads any network, the source is
files joined by arrows, and the first questions are the ones asked of every
other: how the links are spread among the files, and how far apart the files
are.

::tangle-network

When this was written, on 29 September 2026, most files were needed by one
or two others and a few by very many, the tail that the log scales keep in
sight. And the files were far more clustered than in a random network of as
many files and links, where two files joined to a third are seldom joined to
each other, while the ways between them were nearly as short. Watts and
Strogatz called a network like that a small world (1998): clustered like a
lattice, near like a random network. Humphries and Gurney made the two one
number, small-world-ness (2008): the clustering over a random network's,
over the length of the ways over a random network's, a small world above
one. Until then it had grown with the source, which says less than it
seems: a random network's clustering falls as it grows with as many links a
file, and this one's had hardly fallen. Christopher Myers found the graphs
of what works with what inside several open-source programs to be small
worlds too, and scale-free, a few of their parts linked to very many (2003);
no such fit is made here.

With nothing chosen, the panel by the picture tells more of the network
at the commit shown: whether files with many links join files with few, as
Newman found technological networks mostly do (2002); how deep its knot is,
its deepest core, what is left when every file with fewer links than some
number is taken away, again and again (Seidman, 1983); and how tall its stack
of what needs what. Choose a file, and it tells the file's own: its place by
PageRank (Brin and Page, 1998), which is to be needed by files that are
themselves needed; how near it is to the rest, and how much it stands between
them (Freeman, 1978).

**The groups the arrows make.** The Louvain method (Blondel and others,
2008) finds the groups a graph makes without being told any. How much a
grouping keeps its arrows inside its groups, beyond what arrows drawn at
random would, is its modularity (Newman and Girvan, 2004); the method moves
each file into the neighbouring group that raises it most, then treats each
group as one file and starts again, until nothing moves. The modularity of
the boxes can be worked out the same way.

::tangle-groups

Some features make a group of their own, whole: islands, as the rules want.
Where the arrows gather several boxes into one group, their files are more
tied to one another than to the rest — often a feature and the part of the
frame it leans on most, sometimes features that lean on the same things.
Set pointing to show its group, and the picture draws any file's.

**The bridges.** Some files stand between the others: most of the shortest
ways from one file to another pass through them, the arrows read either
way. Set the size to bridges, and the picture shows how much each does.

::tangle-bridges

When this was written, on 28 September 2026, the first three were the
contract every feature fulfils, the one way to make an element on the page,
and the one way to make text safe to print: files where much of the source
meets. Read either way, the arrows say where the parts of the source meet,
not which way a change would go; a file that needs nothing carries no change
through it.

**How far a change could reach.** Every arrow is a road a change could take
back to what needs it. The share of the source a change to one file could
reach, on average, following them all the way, is a design's propagation
cost (MacCormack, Rusnak and Baldwin, 2006); set the size to reach, and the
picture shows each file's.

::tangle-reach

A source that grows by features, which little else needs, sees it fall: a
change inside a new feature can reach little beyond it. How far changes did go,
rather than could, is on [how this site changes](/projects/changes/).

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
