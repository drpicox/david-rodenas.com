---
title: Hot nights, counted
summary: How many nights a year never cool below 25 °C, and how many days reach 30 °C, at nine weather stations and in six long series since 1950, whether the second half of each record differs from the first, and Barcelona's mean temperature every year since 1780.
order: 32
was: /open-data/hot-nights/
---

# Hot nights, counted

A night whose lowest temperature stays at 25 °C or above is called a torrid
night, and at 20 °C a tropical one: the house does not cool down and nobody
sleeps well. The Meteocat publishes the daily minimum of every automatic
station it runs. This counts the torrid ones, year by year, and cuts each
record in two to see whether it has moved:

::weather

The threshold slides, because what the site keeps is not the count but a
histogram of each month's days. Move it down to 20 °C and the nights are
tropical; choose another kind of day and the same page counts hot afternoons,
frost, or rain. At the end of the list are six of the Meteocat's long series,
which reach back to 1950: [the long record](#the-long-record), below, is drawn
from them.

## What is in it

- **The nights at 25 °C or more are where the Raval changes most**: 6.1 a
  year before 2016, 19.8 since.
- **Every one of the nine stations has more tropical nights in the second
  half of its record than in the first.** At Badalona, 75.1 a year became
  86.1. At the Raval, in the middle of Barcelona, 93.2 became 103.0.
- **2022 is the year with most tropical nights at four of the nine, and with
  most days at 30 °C or more at eight of them.**
- **The exception is worth as much as the rule.** The Observatori Fabra, on
  its hill above Barcelona, has fewer days at 30 °C or more in its second
  half than in its first, 33.9 against 42.3. Its first half holds the summer
  of 2003. The observatory's long series says the opposite over the very
  same years — 30.9 a year from 2003 to 2013, 39.7 from 2014 to 2025 — and
  the two part most from 2005 to 2007, when the station counted 155 such days
  and the series 62. The series is homogenised; the station is not.
- **Rain does not move the same way.** Days with 1 mm or more go slightly up
  at some stations and slightly down at others, and the largest difference
  between two halves is five days a year.

## The long record

The network's automatic stations reach back to 1988 at the most, and six of
the nine only to 2005 or later. The Meteocat's climatologists keep longer
series: a day at a time since 1950, every day checked and the whole
homogenised, so that a station moved or a thermometer replaced does not show
as a step, and blended, where one record breaks off, from the stations around
it. And one longer still: Barcelona's mean temperature, month by month, since
1780. It was put together with the University of Barcelona from the records
of the doctors who measured the city — the first of them, Francesc Salvà, in
his house in carrer de Petritxol — and from the Observatori Fabra, where most
of it comes from.

What follows is a blueprint: the pictures are drawn by nodes wired together,
and the dials on the board turn them. Its menu holds a few more questions —
where the long line turns, the six long series side by side, the summers
since 1780, and whether a warm year is a year of warm nights.

```::blueprint
## Barcelona, since 1780
# Barcelona's mean temperature every year since 1780, from the Meteocat's long series of the city. Under it, the Observatori Fabra since 1950, from its checked and homogenised series: the nights that did not cool below the first dial, and the days that reached the second, a bar a year. Turn the dials to 25 and 35 °C for the torrid ones.
years = barcelona-years
lines "Barcelona's mean temperature, year by year" table: years x: year y: mean
nights-from = dial "Nights from, °C" value: 20
days-from = dial "Days from, °C" value: 30
nights = weather-days station: baic0008 kind: tropical-nights threshold: nights-from
bars "Nights at the Fabra at least as warm as the first dial" table: nights x: year y: days
days = weather-days station: baic0008 kind: hot-days threshold: days-from
bars "Days at the Fabra at least as hot as the second dial" table: days x: year y: days

## Where the long line turns
# The same 246 years, cut in two at the dial's year: the straight line through the years before the cut, and the one through the years from it on, each as the change it makes a decade. Move the cut, and see how much of the change lives after it.
cut = dial "Cut at" value: 1972
years = barcelona-years
lines "Barcelona's mean temperature, year by year" table: years x: year y: mean
before = keep "Before the cut" table: years column: year is: below value: cut
after = keep "From the cut on" table: years column: year is: at-least value: cut
early = trend table: before y: mean
late = trend table: after y: mean
readout "Before the cut, each decade" value: early.per-ten unit: °C about: "along the straight line through the years before the cut"
readout "From the cut on, each decade" value: late.per-ten unit: °C about: "along the straight line through the years from the cut on"

## The six long series, side by side
# Every long series at once, a line each, named by its town, by joining the series to where they stand: the days of a kind a year, since 1950. Turn the kind on the board — tropical nights, hot days, frost.
kind = dial "Kind of day" value: tropical-nights
days = weather-days station: all-series kind: kind
names = weather-stations
named = join left: days right: names
lines "Days a year, a line a series" table: named x: year y: days split: municipality

## Summers since 1780
# One season of every year since 1780: its months kept, then a row a year, the season's mean, and the straight line through it. The dial is a list of the seasons. Winter is December to February, each December counted with its own year.
which = dial "Season" value: summer
months = barcelona-months
only = keep "Only one season" table: months column: season is: equals value: which
years = group "A year a row" table: only by: year value: mean how: mean
lines "The season's mean, year by year" table: years x: year y: mean
trend = trend table: years y: mean
readout "Each decade" value: trend.per-ten unit: °C about: "along the straight line fitted through the years"

## Is a warm year a year of warm nights?
# Barcelona's mean temperature each year against the tropical nights at the Observatori Fabra that year, since 1950: the two series joined by the year. Both rise along the years, and that alone would make them go together; a correlation says what goes with what, never why.
years = barcelona-years
nights = weather-days station: baic0008 kind: tropical-nights
both = join left: years right: nights
scatter "Tropical nights against the year's mean, a dot a year" table: both x: mean y: days
together = correlation table: both x: mean y: days
readout "r" value: together.r about: "of a year's mean temperature and its tropical nights at the Fabra"
```

- **Barcelona has not been as warm in the 246 years of its series as in the
  last four.** The four warmest years are 2022, at 18.1 °C, 2023, 2025 and
  2024; the ten warmest are all of this century, and nine of them since 2011.
  The coldest is 1816, the year without a summer.
- **For a century, a year at 15 °C was rare.** Two years reached it before
  1880, 1798 and 1846; 26 of the hundred from 1880 to 1979; 40 of the 46
  since 1980, and every one since 1997.
- **It was nearly flat, and then it was not.** Cut at 1972, the straight line
  through the years before rises 0.05 °C a decade, and the one through the
  years after, 0.51: ten times as steep.
- **At the Observatori Fabra, tropical nights doubled**: 21.4 a year from
  1950 to 1987, 43.3 from 1988 to 2025, and 76 in 2022. Days at 30 °C or more
  went from 11.3 a year to 29.3.
- **2025 had the most torrid days and nights at the Fabra since 1950**: 14
  days at 35 °C or more, and 13 nights at 25 °C or more. Until 2003, no year
  had had more than three of either.
- **All six long series have more tropical nights and more hot days in their
  second half than in their first, and fewer frosts.** By the sea at el Prat,
  tropical nights went from 51.4 a year to 72.2; at Lleida, inland, days at
  35 °C or more from 11.2 to 22.1. 2022 has the most days at 30 °C or more of
  the record at all six.

## What it is not

Each station is cut in half over its own years, so two stations' halves are
different periods: a record that starts in 2009 has no flat 1990s in it, and
will look steeper for that alone. Compare a station with itself.

The network's stations are not homogenised. A sensor replaced, a screen
moved, a car park built next door: each can make a step that has nothing to
do with the climate, and nothing here corrects for it. A station is never
joined to another, even in the same town. The long series are the opposite:
the Meteocat has corrected them for exactly that, and blended stations into
them where a record broke off, which is what lets them reach back to 1950. A
long series and a station in the same place, as the two at the Observatori
Fabra, do not give the same numbers: compare a record with itself, never one
kind with the other.

A year missing more than one day in twenty is drawn as an outline and kept
out of every mean. The year still running is drawn in grey, up to the last
day the Meteocat has, and is kept out of every mean and out of both halves:
it is not over, and its days can still be corrected. The long series have no
year still running: the Meteocat adds a whole year to them once it is over.

Barcelona's series since 1780 holds a mean for each month, and a year's mean
is the mean of its twelve. Its first decades were read in doctors' houses,
with the instruments of their day; the Meteocat has checked and homogenised
the whole, and places it at the Observatori Fabra, 411 m up, where most of
it was measured.

The names — tropical night, torrid night — are common usage, not official
definitions. Frost is "below 0 °C" rather than "0 °C or below" because only
the first can be counted exactly from the histograms. The difference between
two halves, and the straight line through a record, describe what a record
did. They are not a forecast, and they do not say why.

## Where it comes from

This is the small version of an explorer I built in the summer of 2026, which
has every station of the network that is still reporting, humidity and a map:
[Nits de calor a Catalunya](https://david-rodenas.com/heatwave/). Here there
are nine stations and four variables, the daily series stays at its source,
and the site keeps only what it derives from it, a finished year at a time,
with the year still running asked for again every day.

The long series are the Meteocat's too: CADTEP, its daily series since 1950
([Sèries climàtiques des de
1950](https://www.meteo.cat/wpweb/climatologia/dades-i-productes-climatics/series-climatiques-des-de-1950/);
Prohom and others, 2023, in the International Journal of Climatology), and
[the climate series of Barcelona since
1780](https://www.meteo.cat/wpweb/climatologia/dades-i-productes-climatics/serie-climatica-de-barcelona-des-de-1780/)
(Prohom, Barriendos, Aguilar and Ripoll, 2012). The site keeps them as it
keeps the stations, a finished year at a time, once the Meteocat has added
it.
