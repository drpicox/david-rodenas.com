---
title: The craft
summary: How I work, and how I think about it — in the code, with others, and behind it all. Each line runs here, or links to where I argued it.
order: 35
was: /craft/writing/
---

# One small step,  
and the code  
works again.

That is [the mantra](https://medium.com/p/1d28b3a78b08) I try to keep with
every change, and the rest of how I work grows from it. Each line below links to where
it runs, here, or to where I argued it.

## In the code

**A test first, and seen failing.** A test that has never failed has not yet
shown that it can: [the kata](/craft/kata/) runs every commit, with the step I
added for it.

**A test is an example of use.** I write it the way I would explain the code
to someone about to use it. Then it survives a refactor, and it catches the bug
that the tests looking inside sleep through: [three
dispatchers](/craft/a-test-is-an-example/) show it.

**The need comes first, in its own words.** A feature starts as the words of
whoever needs it, and [those words become the test](/craft/the-post-is-the-test/).

**Clean as I go.** Before a change, where it will land; while I make it; and
once more when it is done, for whoever reads it next. Not as a phase saved for
the end, and never by starting again: when the design is wrong, I move the code
towards the right one a little with every change. Kent Beck put the first part
in one line: [make the change easy (warning: this may be hard), then make the
easy change](https://x.com/KentBeck/status/250733358307500032). [The
book](/book/) is the rest, whole.

## With others

**Pairing is the better code review.** It never stops, I often use it to bring
beginners up to speed, and it leaves nobody indispensable — and [nobody should
be, not even an AI](https://medium.com/p/b3f6fcbc3b95). On the critical parts
that all of us will work on later, I would rather we mob, test first.

**Help is a smaller step, not the answer.** When someone asks me for help, I
often keep the solution to myself and propose trying again in [steps so
small](https://medium.com/p/264b61d489f8) that the way becomes plain. It looks
simple, and it takes practice; that is what katas are for.

**Curious before right.** In a review I try to understand why the author did
it, and [ask with genuine curiosity](https://medium.com/p/206be5c44a92). A
comment should block a merge only when the product is at risk; the rest can
wait for a later change, or for the whole team, on a Friday.

**Change the environment, not the people.** [The environment changes
us](https://medium.com/p/834692848569), so a rule that matters goes into the
code, where it holds for a person and for an agent alike, rather than into a
guide: [this site](/projects/architecture/) is built that way. And a change to
how we work is [an experiment](https://medium.com/p/9e94fba6beb3), with a date
to look back at it together.

**The credit is the team's.** When a system where every new feature brought
new bugs turned around [without stopping
delivery](https://medium.com/p/9467d18a788b), it was not me who fixed it: it
was my team, working a new way.

## Behind it

**I started against it.** I was a detractor of testing: at meetups everyone
showed how, and [no one showed why](https://medium.com/p/96c7a7dfff1e). That
began to change when I contributed to [AngularJS](/open-source/angularjs/). So
I teach it starting from why, because it is counterintuitive: in 2017 I told a
room of students that doctors have the Hippocratic oath, and we have testing.

**Assume I got it wrong.** That, for me, is [the essence of
agile](https://medium.com/p/aa012cd24186): leave room to find the mistake and
fix it, in the design and in the requirement alike.

**The responsibility stays mine.** With an AI, on code I mean to keep, the
rhythm is the same: I direct it one step at a time and commit between steps. I
ask for the clean step on every cycle, because left alone it forgets the
refactor; and I tell it that finding nothing to clean is a correct answer,
because pushed, it invents something — [asking to clean is only half an
instruction](https://medium.com/p/0b5058e302bf). When I caught myself letting
my assistant do the designing, [I switched it off](https://medium.com/p/37023881ba0a)
until the design was mine again.

**Share what worked.** Whoever has something worth sharing should share it: it
is what took me to meetups, and what keeps me publishing every Saturday — [the
essays](/essays/) are gathered by subject. I teach it as well — [a recipe for
concurrency](/teaching/raft/), [a course where the post came
first](/teaching/software-lab/) — and say it out loud in [talks](/talks/).
