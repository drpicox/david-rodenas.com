---
title: Blueprints
summary: The data this site keeps — the weather, the air, the sea, its own source — as nodes to wire together, the way Unreal and Unity wire their programs: sources, filters, steps, statistics and pictures, with dials to turn. Nineteen examples to start from, the last one yours.
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

- **A wire goes from an output**, on the right of a node, **into an input**
  on the left of another, of the same colour: a table into a table, a number
  into a number. While one is dragged, the pins it fits are lit.
- **Choose a node**, and what could come next is offered under the canvas,
  read off what it gives: a picture of it, the years measured whole, the
  season taken out, a join with another source standing apart. A click adds
  it, wired and written, and offers what could come after that.
- **Press an output's name** to look at what it gives: a table's first rows,
  and what its columns are. A wire says what it carries when pointed at.
- **Drag from a pin** to wire it. Let go on another pin to join them, or in
  empty space to choose what comes next, from what fits.
- **Double-click** the canvas, or press the space bar, to add any node.
- **Drag a node by its title** to move it, and the canvas to move about;
  **Ctrl and the wheel** zoom. Shift and a drag choose several; Delete takes
  them away, and Ctrl+Z brings them back.
- **◉**, beside a value, puts it on the board as a dial. The title of every
  picture on the board finds its node.
- **Examples** opens any of the nineteen below; **Full screen** gives the
  editor the whole window; **Text** shows the blueprint as text, to read, to
  copy, or to write by hand.

Everything runs here, in your browser, on the files this site serves, and
your changes to each example are kept in this browser until you reset them.
**Link** copies a link that opens a blueprint as you left it.

Nineteen to start from, each a working blueprint, in the editor's
**Examples** menu or here:

- **The weather and the air**: [nights that do not cool](#nights-that-do-not-cool), a source, a picture and a trend; [one season, year by year](#one-season-year-by-year), with filters; [a working day, in NO2](#a-working-day-in-no2), a heat map; [the NO2 through the day](#the-no2-through-the-day), a line a season and each month's highest hour; [thirty years of NO2](#thirty-years-of-no2-every-measuring-point), every measuring point joined to its name.
- **The two, crossed**: [does the heat bring the NO2?](#does-the-heat-bring-the-no2), the season and the years taken out; [patterns of heat and NO2](#patterns-of-heat-and-no2), season by season, the rain, the span of a day; [does the NO2 rise as the evening cools?](#does-the-no2-rise-as-the-evening-cools), a guess put to the data; [what the lockdown did to the evening](#what-the-lockdown-did-to-the-evening), the spring of 2020; [does a warm sea go with warm nights?](#does-a-warm-sea-go-with-warm-nights), the sea beside the weather — and [the sea's own page](/projects/sea/) has more of it.
- **This site's own source**: [the files everything needs](#the-files-everything-needs), by PageRank; [how much the files are needed](#how-much-the-files-are-needed), a histogram; [what changes, and what is needed](#what-changes-and-what-is-needed); [files that keep changing](#files-that-keep-changing), a filter on the graph; [the groups the arrows make](#the-groups-the-arrows-make), tangled; [the source, grown](#the-source-grown), a dial along every commit.
- **The programs**: [technical debt](#the-programs-as-nodes) and [the rocket](#the-rocket-as-a-node), as nodes.
- **[Your own](#your-own)**: a table you paste.

Between them they paint every picture a blueprint can — bars, lines, a
scatter, a heat map, a histogram, a table, a number, the source in its boxes
and tangled, a program's own — and read every kind of data the site keeps.

```::blueprint
## Nights that do not cool
# The simplest: one source, one picture, one statistic. The days of a kind at a weather station, year by year, a bar a year — faint where the year was not measured whole, or is still running — and the straight line fitted through the whole years, as the change it makes each decade. Turn the station and the kind on the board.
station = dial "Station" value: WU
kind = dial "Kind of day" value: torrid-nights
days = weather-days station: station kind: kind
bars "Days a year" table: days x: year y: days faded: whole
whole = keep "Only the whole years" table: days column: whole is: equals value: yes
trend = trend table: whole y: days
readout "Each decade" value: trend.per-ten unit: days about: "the change along the straight line fitted through the whole years"

## One season, year by year
# Filters keep some rows and leave the rest. Here, the months of one season, of the years measured whole; then a row a year, the season's mean night, and the straight line through it. A filter's value is offered from the column's own values, so the dial is a list of the seasons.
which = dial "Season" value: summer
months = weather-months station: X4
only = keep "Only one season" table: months column: season is: equals value: which
whole = keep "Only the months measured whole" table: only column: whole is: equals value: yes
years = group "A year a row" table: whole by: year value: tn how: mean
lines "The season's mean night, year by year" table: years x: year y: tn
trend = trend table: years y: tn
readout "Each decade" value: trend.per-ten unit: °C about: "along the straight line fitted through the years"

## A working day, in NO2
# The table the NO2 page draws, made of its parts: a measuring point's mean at every hour of the day in every month of the year. Monday to Friday has a shape a weekend has not; choose the days on the board. The network numbers its hours 1 to 24, and does not say by which clock.
where = dial "Measuring point" value: 08019043
days = dial "Days" value: workdays
hours = no2-hours station: where days: days from: 2015
heatmap "NO2, hour by hour and month by month" table: hours x: month y: hour value: no2

## The NO2 through the day
# A measuring point's day, hour by hour, a line a season: a dip in the afternoon, and a rise into the evening. Under it, the hour the evening is at its highest, month by month — later in summer than in winter at most points; at Eixample and Gràcia, in Barcelona, it hardly moves. Choose the days on the board: weekends too. The network numbers its hours 1 to 24, and does not say by which clock.
point = dial "Measuring point" value: 17079003
days = dial "Days" value: workdays
day = no2-hours "Every year together" station: point days: days
seasons = group "A row an hour and a season" table: day by: hour and: season value: no2 how: mean
lines "NO2 through the day, a line a season" table: seasons x: hour y: no2 split: season
late = keep "From hour 16 on" table: day column: hour is: at-least value: 16
highs = top "Each month's highest hour" table: late by: no2 count: 1 per: month
lines "The hour the evening is at its highest, month by month" table: highs x: month y: hour

## Thirty years of NO2, every measuring point
# Every measuring point's yearly mean, a line each, named by joining the points to their names. The trend is of all of them at once, which says less than any one line does: pull a wire out of the table into empty space, and keep the rows of one point to see its own.
years = no2-years station: all
names = no2-stations
named = join left: years right: names
whole = keep table: named column: whole is: equals value: yes
lines "NO2 a year, a line a measuring point" table: whole x: year y: no2 split: name
trend = trend table: whole y: no2
readout "Each decade, every point together" value: trend.per-ten unit: µg/m³

## Does the heat bring the NO2?
# The Meteocat's weather station and the Generalitat's measuring point in one town, month by month. As measured, warm months have less NO2 than cold ones: that is the season, which both follow. Each month less its month's mean takes the season out, and less its year's mean too takes out the years, along which the air has got cleaner and the weather warmer; what is left can have the other sign. A correlation says what goes with what, never why. Badalona, Sabadell, Girona and Tarragona have both.
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

## Patterns of heat and NO2
# The same two networks, taken further apart, on Girona. With the season and the years taken out, what is left of each month kept to the summers, against the heat of the day; to the winters, against the cold of the night; set against the rain; and against the span between a day's highest and lowest, which a formula works out. The heat map is what is left of the NO2, month by year: which months stood out, and when.
town = dial "Weather station" value: XJ
point = dial "Measuring point" value: 17079003
heat = weather-months station: town
air = no2-months station: point
both = join left: heat right: air
whole = keep "Months measured whole" table: both column: whole is: equals value: yes
seasonless = season "Less each month's mean" table: whole by: month
odd = season "Less each year's mean too" table: seasonless by: year
spanned = formula "The day's span, added" table: odd name: span formula: "tx - tn" unit: °C
summers = keep table: spanned column: season is: equals value: summer
winters = keep table: spanned column: season is: equals value: winter
hot = correlation table: summers x: tx y: no2
cold = correlation table: winters x: tn y: no2
wet = correlation table: spanned x: rain y: no2
wide = correlation table: spanned x: span y: no2
readout "Summers: the heat of the day" value: hot.r about: "r of the daily maximum and NO2, summers only"
readout "Winters: the cold of the night" value: cold.r about: "r of the daily minimum and NO2, winters only"
readout "The rain" value: wet.r about: "r of the month's rain and NO2"
readout "The day's span" value: wide.r about: "r of the gap between the day's highest and lowest, and NO2"
scatter "The day's span against NO2, a colour a season" table: spanned x: span y: no2 colour: season
heatmap "What is left of the NO2, month by year" table: odd x: month y: year value: no2

## Does the NO2 rise as the evening cools?
# A guess, put to the data: at the end of the day the air cools, and the NO2 comes down with it. There are no hourly temperatures here, only each day's highest and lowest; so the blueprint asks it month by month — how much the NO2 rises from the afternoon to the evening, against how cold the month's nights were and how much its days cooled, the span between their highest and lowest — with the season and the years taken out, as in the two before it. The hours of the afternoon and of the evening are dials. A correlation says what goes with what, never why.
point = dial "Measuring point" value: 17079003
town = dial "Weather station" value: XJ
days = dial "Days" value: workdays
afternoon-hours = dial "The afternoon, hours" value: "13 16"
evening-hours = dial "The evening, hours" value: "19 22"
hours = no2-hours "Each year apart" station: point days: days years: each
early = keep "The afternoon's hours" table: hours column: hour is: between value: afternoon-hours
late = keep "The evening's hours" table: hours column: hour is: between value: evening-hours
early-mean = group "The afternoon, a row a month" table: early by: year and: month value: no2 how: mean name: afternoon
late-mean = group "The evening, a row a month" table: late by: year and: month value: no2 how: mean name: evening
paired = join left: late-mean right: early-mean
rise = formula "The evening's rise" table: paired name: rise formula: "evening - afternoon" unit: µg/m³
weather = weather-months station: town
both = join left: rise right: weather
whole = keep "Months measured whole" table: both column: whole is: equals value: yes
spanned = formula "The day's span, added" table: whole name: span formula: "tx - tn" unit: °C
seasonless = season "Less each month's mean" table: spanned by: month
odd = season "Less each year's mean too" table: seasonless by: year
summed = summary table: whole column: rise
measured = correlation table: spanned x: tn y: rise
cold = correlation table: odd x: tn y: rise
wide = correlation table: odd x: span y: rise
readout "The evening's rise" value: summed.mean unit: µg/m³ about: "the mean, month by month, of the evening's hours less the afternoon's"
readout "Colder nights, as measured" value: measured.r about: "r of the daily minimum and the rise: the season, mostly"
readout "Colder nights, the season and the years out" value: cold.r about: "r of what is left of each, month by month"
readout "Days that cool more, the season and the years out" value: wide.r about: "r of the span between the day's highest and lowest, and the rise"
scatter "What is left of each month: the day's span against the evening's rise" table: odd x: span y: rise colour: season

## What the lockdown did to the evening
# In the spring of 2020 Spain was in lockdown: few cars on the streets, and people at home. A measuring point's April, hour by hour, a line a year: in 2020 the NO2 fell, and the evening's rise all but went, while the morning's stayed, smaller. Under it, the evening's rise in that month, year by year. That April was also the wettest in years, and its days cooled least, which by the guess before would shrink the rise too; but wet Aprils before it still rose. Turn the month: in March, half of it in lockdown, the rise was smaller; in May it was all but gone too.
point = dial "Measuring point" value: 17079003
which = dial "Month" value: 4
hours = no2-hours "Each year apart" station: point days: all years: each
month = keep "One month" table: hours column: month is: equals value: which
some = keep "Five years" table: month column: year is: between value: "2017 2021"
lines "NO2 through the day, a line a year" table: some x: hour y: no2 split: year
early = keep "The afternoon, hours 13 to 16" table: month column: hour is: between value: "13 16"
late = keep "The evening, hours 19 to 22" table: month column: hour is: between value: "19 22"
early-mean = group "A row a year" table: early by: year value: no2 how: mean name: afternoon
late-mean = group "A row a year" table: late by: year value: no2 how: mean name: evening
paired = join left: late-mean right: early-mean
rise = formula "The evening's rise" table: paired name: rise formula: "evening - afternoon" unit: µg/m³
bars "The evening's rise in that month, year by year" table: rise x: year y: rise

## Does a warm sea go with warm nights?
# The sea off Barcelona, from NOAA's daily analysis, and the Meteocat's weather station of Badalona, by the sea, month by month. Both follow the season, and both the years; with each month less its month's mean, and less its year's, what is left is how unusual a month was, and whether an unusually warm sea went with unusually warm nights. A correlation says what goes with what, never why.
sea = sea-months point: barcelona
nights = weather-months station: WU
both = join left: sea right: nights
whole = keep "Months measured whole" table: both column: whole is: equals value: yes
seasonless = season "Less each month's mean" table: whole by: month
odd = season "Less each year's mean too" table: seasonless by: year
measured = correlation table: whole x: sst y: tn
left = correlation table: odd x: sst y: tn
readout "As measured" value: measured.r about: "r of the sea's monthly mean and the mean night, month by month"
readout "The season and the years taken out" value: left.r about: "r of what is left of each"
scatter "What is left of each month: the sea against the nights" table: odd x: sst y: tn colour: season

## The files everything needs
# This site's own source, at its last commit, as a graph: a node a file, an arrow a file that needs another. Measured by PageRank — needed by what is itself needed — the ten at the top, and the whole source drawn as the architecture page draws it, each file as big as the files that need it and as deep as its PageRank.
source = source
ranked = measure graph: source what: pagerank
ten = top table: ranked by: pagerank count: 10
show-table "The ten most needed, by PageRank" table: ten rows: 10
picture "The source, as needed as it is" graph: ranked size: needed colour: pagerank

## How much the files are needed
# A histogram: the files of this site's source by how many others need them, cut into bins with round edges, a bar a bin. Most are needed by few, and a few by very many: the tail the architecture page draws on its log scales.
source = source
files = files graph: source
spread = histogram table: files column: needed bins: 20
bars "Files, by how many need them" table: spread x: from y: count
summed = summary table: files column: needed
readout "Half the files are needed by at most" value: summed.median unit: files
readout "The most needed is needed by" value: summed.highest unit: files

## What changes, and what is needed
# A file many others need is hard to change, which, as Robert C. Martin says, only hurts if it has to change. Each file's commits so far against how many files need it, and the correlation of their ranks, which asks only whether the files needed more are the ones changed more.
source = source
changed = measure graph: source what: changes
scatter "Changes against needed by, a dot a file" table: changed x: needed y: changes label: file
ranks = correlation table: changed x: needed y: changes of: ranks
readout "Spearman's r" value: ranks.r about: "of how many files need a file and how many commits changed it"

## Files that keep changing
# A filter on a graph: only the files changed at least as many times as the dial says — a slider, since the filter compares numbers — drawn where they stand, as big and as warm as their changes, and listed, the most changed first.
often = dial "Changed at least" value: 10
source = source
changed = measure graph: source what: changes
kept = keep-files "Only the files changed that often" graph: changed column: changes is: at-least value: often
picture "Where they stand" graph: kept size: changes colour: changes
ranked = sort table: kept by: changes order: falling
show-table "The files, the most changed first" table: ranked rows: 12

## The groups the arrows make
# The Louvain method finds the groups a graph makes without being told any (Blondel and others, 2008). Each file coloured by its group, and the source tangled, with no boxes, only the pull of what needs what; and how much the groups keep their arrows inside, their modularity (Newman and Girvan, 2004).
source = source
grouped = measure graph: source what: group
picture "Tangled, a colour a group" graph: grouped colour: group layout: tangle
figures = network graph: source
readout "Modularity of the groups" value: figures.modularity

## The source, grown
# The history plays here too: a dial along every commit that changed the source, and the source as it stood then. Under it, the files that ship after each commit, the whole history long.
when = dial "Commit" value: 60
then = source commit: when
picture "The source then" graph: then
commits = commits
lines "Files, commit after commit" table: commits x: commit y: files

## The programs, as nodes
# Every program on this site is a node as well — the simulation of technical debt, the relativistic rocket — its dials its inputs, the figures of its answer its outputs, a list of them a table, and its own picture on the board. Here a dial turns the interest a shortcut costs, and the months the simulation gives back are drawn again as two lines, beside the month in which the clean road overtakes the one with shortcuts.
interest = dial "Interest a shortcut costs, %" value: 10
debt = technical-debt interest: interest
lines "Features delivered, both roads" table: debt.months x: month y: cleanCumulative and: debtCumulative
readout "The clean road overtakes at month" value: debt.break-even-month

## The rocket, as a node
# The relativistic rocket is a node too: two of its dials on the board, and two of its numbers wired into numbers — the years the crew lives through, and the years that pass at home. Its own table, of every destination at that acceleration, comes onto the board with it. It gives numbers and takes numbers and a destination, so it wires to what takes a number: a Number, a Formula's table, not the NO2.
pull = dial "Acceleration" value: 1
where = dial "To" value: "Tau Ceti"
trip = rocket acceleration: pull to: where
readout "Years on board" value: trip.trip-on-board-years
readout "Years at home" value: trip.trip-at-home-years

## Your own
# A table of your own, pasted into the node — a first line of names, then a line a row; from a spreadsheet it comes with tabs, which are read too — and a picture of it. Wire it to anything else here: join it to a station's years, or set it beside the NO2.
mine = your-data text: "year, value\n2021, 3\n2022, 5\n2023, 4\n2024, 8\n2025, 7"
bars "Your numbers" table: mine
```

## How it is made

A blueprint is written in this page as text, one node a line —
`name = kind input: value`, where a value that names another node is a wire
from it, unless the input names a column or holds words of its own, where a
wire names the output after a dot, as `y: dial.value` — and the build runs it
on the same files the browser fetches, so the pictures are in the page before
any script: the first blueprint is drawn under its board, and the text of
every one is there to read. The nineteen
are written in one place, each under a `## Title` line, with what it is about
in `#` lines under it, which the language reads as remarks. In the browser,
the same text becomes the canvas, and its Examples menu. A feature of the
site brings the nodes about its own data, as it brings its pages and its
tools; the frame brings the dials, the steps, the statistics and the pictures
every blueprint has.

How the site itself is built, and the rules it is held to, is
[another page](/projects/architecture/).
