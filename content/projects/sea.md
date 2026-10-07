---
title: The sea, a day at a time
summary: The temperature of the sea's surface off four stretches of the Catalan coast, every day since 1982 — its mean year by year, the days it is warm, and this year beside what is usual for each day.
order: 33
---

# The sea, a day at a time

Every day, NOAA puts together the temperature of the surface of every sea
from what satellites, ships and buoys measure, on a grid of quarter degrees:
its daily Optimum Interpolation analysis, OISST. This site keeps four of its
cells, off L'Estartit, Barcelona, Tarragona and the Ebre delta, a value a
day since 1982, and the year still running up to three days ago.

What follows is a blueprint: the pictures are drawn by nodes wired together,
and the dials on the board turn them. Its menu holds a few more questions —
this year day by day, the four points side by side, and whether a warm sea
goes with warm nights.

```::blueprint
## The sea, year by year
# The mean of each year's days off a stretch of coast, and the straight line through the whole years, as the change it makes each decade; under it, the days of each year the sea was at least as warm as the dial, faint where the year is not whole. Turn the point, and the warmth.
off = dial "Off" value: barcelona
warmth = dial "Warm from, °C" value: 26
years = sea-years point: off warm: warmth
whole = keep "Only the whole years" table: years column: whole is: equals value: yes
lines "The sea's mean, year by year" table: whole x: year y: sst
trend = trend table: whole y: sst
readout "Each decade" value: trend.per-ten unit: °C about: "the change along the straight line fitted through the whole years"
bars "Days at least as warm as the dial" table: years x: year y: warm faded: whole
warmer = trend table: whole y: warm
readout "Warm days, each decade" value: warmer.per-ten unit: days about: "the change in the days a year at least as warm as the dial"

## This year, day by day
# The year still running, day by day, beside what is usual for each day: the mean of the same day from 1991 to 2020, the thirty years climatologists take. Where the line runs over the normal, the sea was warmer than usual for the day.
off = dial "Off" value: barcelona
days = sea-days point: off
lines "This year, and the normal for each day" table: days x: day y: sst and: normal
above = summary table: days column: above
readout "Above the normal, on average" value: above.mean unit: °C about: "the mean of each day less its normal, this year so far"

## The four points, summer by summer
# The four cells side by side: the mean of each summer, June to August, a line a point, named by joining the points to their names.
months = sea-months point: all
names = sea-points
named = join left: months right: names
whole = keep table: named column: whole is: equals value: yes
summers = keep table: whole column: season is: equals value: summer
years = group "A summer a row" table: summers by: year and: name value: sst how: mean
lines "Summer's mean, a line a point" table: years x: year y: sst split: name

## Does a warm sea go with warm nights?
# The sea off Barcelona and the weather station of Badalona, by the sea, month by month. Both follow the season, and both the years; with each month less its month's mean, and less its year's, what is left is how unusual a month was, and whether an unusually warm sea went with unusually warm nights. A correlation says what goes with what, never why.
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
```

## What is in it

- **The sea is warmer at all four points than when the record starts.** Off
  Barcelona, the mean of a year's days was 17.6 °C over 1982–1991 and 19.1 °C
  over 2016–2025. The straight line through the whole years rises between
  0.38 and 0.45 °C a decade at the four points, and the summers' between 0.50
  and 0.63.
- **Days at 26 °C or more have gone from rare to usual, except in the
  north.** Off Barcelona there were 1.3 a year over 1982–1991 and 34.7 over
  2016–2025, and 2025 had 68; off the Ebre delta, 14.9 became 50.2, and 2025
  had 87. Off L'Estartit, the coolest of the four, the sea seldom gets there:
  four days in 2006, its most.
- **The warmest year was 2025 off Barcelona, and 2022 off the other three.**
  The warmest day off Barcelona was 23 August 2023, at 28.73 °C; off
  Tarragona and the Ebre delta, 10 August 2003.
- **A warm sea goes with warm nights.** Off Barcelona, against the nights at
  Badalona, month by month, with the season and the years taken out, r is
  0.45, and 0.76 in summers alone: a month whose sea was warmer than usual for
  its season and its year had warmer nights than usual too. The other pairs
  of a point and a station by the sea point the same way.

## What it is not

A cell is about 25 km across, and is the open sea off a place, not the water
at its beach: the one off Barcelona has its centre some fifteen kilometres
out. OISST is an analysis, not a thermometer — where there is no measurement,
the grid is filled in from what is around it — and the dataset itself warns
that values less than fifteen days old may still be revised. A finished year
is kept only from the middle of the following January, once they are not.

Every figure above is of the whole years, 1982 to 2025. The year still
running is drawn day by day in the blueprint's second question, beside its
normal, and is kept out of every one of them: it is not over, and its last
fifteen days can still change. A trend is the straight line through the whole
years, and says what the record did, not what it will do, nor why; a
correlation says what goes with what, never why.

## Where it comes from

NOAA's daily Optimum Interpolation Sea Surface Temperature, version 2.1
(Huang and others, 2021), from the server of NOAA's Physical Sciences
Laboratory: data provided by the NOAA PSL, Boulder, Colorado, USA, from their
website at [psl.noaa.gov](https://psl.noaa.gov/data/gridded/data.noaa.oisst.v2.highres.html).
The site keeps the days of four cells, a finished year at a time, and asks
for the year still running again every day; the weather beside it is the
Meteocat's, as on [the page of hot nights](/projects/hot-nights/).
