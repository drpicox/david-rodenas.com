---
title: Blueprints
summary: The data this site keeps — the weather, the air, its own source — as nodes to wire together, the way Unreal and Unity wire their programs: sources, steps, statistics and pictures, with dials to turn. Ten to start from, the last one yours.
order: 92
---

# Blueprints

A blueprint is a program drawn as boxes and wires. Unreal calls its visual
scripts by that name, and Unity draws its own the same way: data comes in on
the left, flows along the wires through each step, and comes out as a
picture. Every wire has the colour of what flows along it — a table is blue,
a number green, a graph orange — so what fits where is seen before it is
tried.

Each page of open data on this site asks its data one question. These are
the same data, and this site's own source, taken apart into nodes that can be
wired into questions of your own: the months at a weather station joined to
the months at a measuring point, a correlation, the season taken out, a
picture.

- **Drag from a pin** to wire it. Let go on another pin to join them, or in
  empty space to choose what comes next, from what fits.
- **Double-click** the canvas, or press the space bar, to add any node.
- **Drag a node by its title** to move it, and the canvas to move about;
  **Ctrl and the wheel** zoom. Shift and a drag choose several; Delete takes
  them away, and Ctrl+Z brings them back.
- **◉**, beside a value, puts it on the board as a dial. The title of every
  picture on the board finds its node.
- **Full screen** gives it the whole window; **Text** shows the blueprint as
  text, to read, to copy, or to write by hand.

Everything runs here, in your browser, on the files this site serves, and
your changes are kept in this browser until you reset them. **Link** copies a
link that opens a blueprint as you left it.

## Nights that do not cool

The simplest: one source, one picture, one statistic. The days of a kind at a
weather station, year by year, a bar a year — faint where the year was not
measured whole, or is still running — and the straight line fitted through
the whole years, as the change it makes each decade. Turn the station and the
kind on the board.

```::blueprint
station = dial "Station" value: WU
kind = dial "Kind of day" value: torrid-nights
days = weather-days station: station kind: kind
bars "Days a year" table: days x: year y: days faded: whole
whole = keep "Only the whole years" table: days column: whole is: equals value: yes
trend = trend table: whole y: days
readout "Each decade" value: trend.per-ten unit: days about: "the change along the straight line fitted through the whole years"
```

## A working day, in NO2

The table the NO2 page draws, made of its parts: a measuring point's mean at
every hour of the day in every month of the year. Monday to Friday has a
shape a weekend has not; choose the days on the board. The network numbers
its hours 1 to 24, and does not say by which clock.

```::blueprint
where = dial "Measuring point" value: 08019043
days = dial "Days" value: workdays
hours = no2-hours station: where days: days from: 2015
heatmap "NO2, hour by hour and month by month" table: hours x: month y: hour value: no2
```

## Thirty years of NO2, every measuring point

Every measuring point's yearly mean, a line each, named by joining the
points to their names. The trend is of all of them at once, which says less
than any one line does: pull a wire out of the table into empty space, and
keep the rows of one point to see its own.

```::blueprint
years = no2-years station: all
names = no2-stations
named = join left: years right: names
whole = keep table: named column: whole is: equals value: yes
lines "NO2 a year, a line a measuring point" table: whole x: year y: no2 split: name
trend = trend table: whole y: no2
readout "Each decade, every point together" value: trend.per-ten unit: µg/m³
```

## Does the heat bring the NO2?

Two networks, side by side, month by month: the Meteocat's weather station
and the Generalitat's measuring point in the same town. Correlated as
measured, the two go together, and the wrong way round for the question:
warm months have less NO2 than cold ones. That is the season, which both
follow. Each month less its own mean takes the season out, and leaves a
second thing they both follow — the years, along which the air has got
cleaner and the weather warmer. Each year's mean taken out too, what is left
is how unusual a month was for its season and its year, and the correlation
of that can have the other sign.

What is left is a question, not an answer: a correlation says what goes with
what, never why. Try the other towns that have both: Sabadell, Girona and
Tarragona.

```::blueprint
town = dial "Weather station" value: WU
point = dial "Measuring point" value: 08015021
heat = weather-months station: town
air = no2-months station: point
both = join left: heat right: air
whole = keep "Months measured whole" table: both column: whole is: equals value: yes
season = season "Less each month's mean" table: whole by: month
years = season "Less each year's mean too" table: season by: year
measured = correlation table: whole x: tx y: no2
seasonless = correlation table: season x: tx y: no2
yearless = correlation table: years x: tx y: no2
readout "As measured" value: measured.r about: "Pearson's r of the mean daily maximum and NO2, month by month"
readout "The season taken out" value: seasonless.r about: "each month less its month's mean"
readout "The years taken out too" value: yearless.r about: "and less its year's mean"
scatter "What is left of each month" table: years x: tx y: no2
```

## The files everything needs

This site's own source, at its last commit, as a graph: a node a file, an
arrow a file that needs another. Measured by PageRank — needed by what is
itself needed — the ten at the top, and the whole source drawn as the
architecture page draws it, each file as big as the files that need it and
as deep as its PageRank.

```::blueprint
source = source
ranked = measure graph: source what: pagerank
ten = top table: ranked by: pagerank count: 10
show-table "The ten most needed, by PageRank" table: ten rows: 10
picture "The source, as needed as it is" graph: ranked size: needed colour: pagerank
```

## What changes, and what is needed

A file many others need is hard to change, which, as Robert C. Martin says,
only hurts if it has to change. Each file's commits so far against how many
files need it, and the correlation of their ranks, which asks only whether
the files needed more are the ones changed more.

```::blueprint
source = source
changed = measure graph: source what: changes
scatter "Changes against needed by, a dot a file" table: changed x: needed y: changes label: file
ranks = correlation table: changed x: needed y: changes of: ranks
readout "Spearman's r" value: ranks.r about: "of how many files need a file and how many commits changed it"
```

## The groups the arrows make

The Louvain method finds the groups a graph makes without being told any
(Blondel and others, 2008). Each file coloured by its group, and the source
tangled, with no boxes, only the pull of what needs what; and how much the
groups keep their arrows inside, their modularity (Newman and Girvan, 2004).

```::blueprint
source = source
grouped = measure graph: source what: group
picture "Tangled, a colour a group" graph: grouped colour: group layout: tangle
figures = network graph: source
readout "Modularity of the groups" value: figures.modularity
```

## The source, grown

The history plays here too: a dial along every commit that changed the
source, and the source as it stood then. Under it, the files that ship after
each commit, the whole history long.

```::blueprint
when = dial "Commit" value: 60
then = source commit: when
picture "The source then" graph: then
commits = commits
lines "Files, commit after commit" table: commits x: commit y: files
```

## The programs, as nodes

Every program on this site is a node as well — the simulation of technical
debt, the relativistic rocket — its dials its inputs, the figures of its
answer its outputs, a list of them a table, and its own picture on the board.
Here a dial turns the interest a shortcut costs, and the months the
simulation gives back are drawn again as two lines, beside the month in which
the clean road overtakes the one with shortcuts.

```::blueprint
interest = dial "Interest a shortcut costs, %" value: 10
debt = technical-debt interest: interest
lines "Features delivered, both roads" table: debt.months x: month y: cleanCumulative and: debtCumulative
readout "The clean road overtakes at month" value: debt.break-even-month
```

## Your own

A table of your own, pasted into the node — a first line of names, then a
line a row; from a spreadsheet it comes with tabs, which are read too — and a
picture of it. Wire it to anything else here: join it to a station's years,
or set it beside the NO2.

```::blueprint
mine = your-data text: "year, value\n2021, 3\n2022, 5\n2023, 4\n2024, 8\n2025, 7"
bars "Your numbers" table: mine
```

## How it is made

A blueprint is written in this page as text, one node a line —
`name = kind input: value`, where a value that names another node is a wire
from it — and the build runs it on the same files the browser fetches, so
the pictures are in the page before any script: the blueprint is drawn under
its board, and its text is there to read. In the browser, the same text
becomes the canvas. A feature of the site brings the nodes about its own
data, as it brings its pages and its tools; the frame brings the dials, the
steps, the statistics and the pictures every blueprint has.

How the site itself is built, and the rules it is held to, is
[another page](/projects/architecture/).
