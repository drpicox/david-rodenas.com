---
title: The Fibergochi
summary: A student of the FIB kept like a Tamagotchi, written in JavaScript in February 1999, one of the first interactive pages I made. Keep it studying, sleeping and finding a terminal until it gets its degree, or it will be thrown out.
order: 41.5
---

# The Fibergochi

A Tamagotchi, but the pet is a student at the FIB, the computer science
faculty in Barcelona. It has to study for exams, find a free terminal
for its labs, sleep, and not get bored, until it gets its degree, or it is
thrown out. I wrote it in JavaScript in February 1999; the code is signed
*Night*. It was one of the first interactive pages I made.

This is it again, with its own drawings: I drew them pixel by pixel, in
the week before it was finished. Its words were in Spanish, and here they
are in English.

::fibergochi

**Study/Sleep** sends it to study or to bed, and it decides which: it
tosses a coin. **Find terminal** sends it to look for a free terminal, and
once it has one, it does its labs there on its own. **http** sets it
browsing, if it holds a terminal. **Beg** is to beg for better marks, and
the answer is always the same. **alfa**, **Bar** and **Friends** were never
written. They did nothing in 1999, and they do nothing here.

The three lamps beside the drawing are an exam to study for, a lab to do,
and a terminal held. After the last day of class the first two blink.
Under the date it says how much there is of each.

A day has sixteen hours, and a term has twenty-five days, twenty of them
with classes. The marks come out on the twenty-second day. A subject is
passed if less than an hour of work is left on it. The code asked for a
step every hundredth of a second; here it is every half second, so a day
lasts twenty-four seconds and a term ten minutes. Time passes only while
the egg is on screen. The Fibergochi is kept in your browser, as a cookie
kept it then, and **new** starts another.

Left alone, it is thrown out for boredom on the sixteenth day of its first
term.

## The rules of the faculty

It starts in the *Fase de Selección*, the first phase of the degree: nine
credits, and in this game a credit is a subject. Anyone who has passed none
after two terms is out, with a single word: *BACARRA*. After four terms,
anyone more than two credits short is out. Anyone one or two short is let
through, but only to the *Técnica*, the shorter degree of fifty credits.
Anyone who passes all nine chooses: the *Superior*, a hundred credits, or
the *Técnica*.

After that come the *alfas*: for each of the last six terms, the credits
passed over the credits taken. Four of them below half, and it is out. And
anyone who finishes the degree gets two messages, the second of which is an
error in `KERNEL386.EXE`, because nobody was expected to get that far.

## What the code of 1999 says

The notes at the top of the file tell how it was made. I did not know how
to use arrays in JavaScript, and I had no internet connection to find out.
So the ten subjects are ten variables, `credito0` to `credito9`, and they
are reached by building the variable's name and evaluating it:

```js
function LeerArray (nom, index)
  {
    return eval (nom + index);
  }
```

A browser kept only twenty cookies, which was not enough for a cookie per
number. So all fifty numbers went into one cookie, four
characters each, which is why every number in it had to stay between −999
and 9999. The notes also warn that Netscape did not tell upper case from
lower case in names. So anything changed was to be tried in Explorer
first.

One line was missing. A student let through to the *Técnica* after four
terms was never taken out of the *Fase de Selección*, so the next term
threw them out after all. That line is added here, and nothing else is
changed.

The credits in the code give the original idea to Sardakuar, and the idea
of actually making it to Josep Llosa, "who does not know we have mentioned
him, or does".
