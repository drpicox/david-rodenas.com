---
title: Two public APIs of AngularJS are mine
summary: Core work in AngularJS, none of it documentation — the compiler, ngClass, the testing module, two benchmark suites and a directive — and what is still in the final release.
order: 3
---

# Two public APIs  
of AngularJS  
are mine.

`$compileProvider.commentDirectivesEnabled()` and
`$compileProvider.cssClassDirectivesEnabled()` went into the AngularJS
compiler on 8 August 2016 -- 1,115 lines across eight files -- and they are
still there. They shipped in 1.5.9 and 1.6.0 and they are in 1.8.3, the last
release the framework ever had, in April 2022. The commit message says what
they were for: *this can result in a compilation speed-up of around 10%*. They
are [in the compiler](https://github.com/angular/angular.js/blob/master/src/ng/compile.js)
today, and the argument that got them in is
[in the pull request](https://github.com/angular/angular.js/pull/14850).

## Where I worked

Not on the documentation. Of the lines I put into AngularJS, thirty-four are
documentation, and they describe the option I had just added. The rest went
into the parts of a framework that people are careful about letting you touch:

The compiler :: Two performance changes in `src/ng/compile.js`, both listed under *Performance Improvements* in the changelog, in 1.5.8 and 1.5.9. Both still in the released bundle.
`ngClass` :: A fix to how it watches, in 1.5.5 and backported to 1.4.11. A test suite. A benchmark. And the idea and much of the implementation behind the rewrite that shipped in 1.6.1 -- the one with the big number.
The testing module :: The implementation of `$componentController`, the helper `ngMock` gives you to unit-test a component's controller without compiling any DOM. Mine since 1.5.0-rc.1, and still mine, verbatim, in 1.8.3.
The benchmarks :: Two benchpress suites, `bootstrap-compile-bp` and `ng-class-bp`, both written because a maintainer asked for numbers he could check. Both still in the repository.
A directive :: `ngRef`, which I proposed as `ngAs` in February 2016 and which shipped in June 2018 with my name in the commit.

## The compiler

A maintainer asked, reasonably, for numbers he could check. So I wrote a
benchmark for the compiler in benchpress -- AngularJS's own measuring harness --
and posted what it said: about 12% off compiling Bootstrap's carousel template,
about 10% off its theme. Ten per cent is what this change is worth, and I have
seen much larger figures attributed to me for it. The large number is real, but
it belongs further down this page and to a different change.

The second compiler change is smaller and I like it more: a `try/catch` inside
the function that collected comment directives was stopping V8 from optimising
the whole function, so I moved it into a function of its own. Nineteen lines.
The comment I left explaining why is still in the source.

## ngClass, and the hundredfold number

`ng-class="{lent: book.lendTo}"` needs exactly one thing from `book.lendTo`:
whether it is there. But `lendTo` might be a person, and a person has books,
and those books have people. AngularJS was deep-watching the expression --
copying that whole graph and comparing the copy -- on every digest, for every
element on the page. The cost was proportional to your data, and as I wrote in
the pull request at the time, the data could be big enough to take seconds to
copy.

Everyone who knew this wrote `!!book.lendTo` instead, so the watcher saw a
boolean. Everyone who did not know spent the afternoon finding out why the
page had frozen, and the answer was a `!!` somebody had forgotten -- or had
never heard of. The fix makes the cost proportional to the number of class
names, so the `!!` stopped being a thing you had to know. That is the whole
of it, and it is why it was worth months.

It shipped in 1.6.1, in a commit written by another maintainer on top of mine,
and the changelog entry for it links to my pull request. His commit message:

> In large based on #14404. Kudos to @drpicox for the initial idea and a big
> part of the implementation.

He asked for a benchmark, so I wrote that too, and it is still in the
repository. It has the case twice: once written the way everyone writes it,
and once with the `!!`. On a single element bound to a large object the fix
measured **more than a hundred times faster** -- about 1.5 milliseconds a
digest down to between 0.02 and 0.08, which is to say down to what the `!!`
had been buying by hand. On long lists, five to ten times, from seven or
thirteen milliseconds down to about one.

Those are my numbers on my own benchmark and nobody reproduced them. And the
same benchmark says that on data already written the careful way, by hand, the
new code is about 25% *slower*. Which is the honest summary of the whole thing:
it does automatically what an experienced Angular programmer would have done
manually, and it is worth having for the same reason type inference is.

## The testing module

`$componentController` is how you unit-test an AngularJS component: give it
the component's name and it hands you the controller, with its bindings,
without compiling a template or touching the DOM. It is the API the component
guide teaches.

I did not invent it. A maintainer added it on 10 January 2016. Two days later I
rewrote how it worked, for two reasons. His version kept a registry inside the
production compiler purely so that a test helper could read it -- test-only
code in `angular.min.js` -- and mine derives the same thing from the injector,
entirely inside the testing module. And if two directives shared a name, his
picked whichever had been registered last; mine filters for the one that is a
component, and refuses if there is not exactly one. That second point came out
of the review, where the objection to my version turned out to be a bug in the
existing one, and the design that settled it is the code that shipped.

It shipped in 1.5.0-rc.1, so the production bundle never carried the extra
bytes in any public release, and it is the implementation in
`angular-mocks.js` at 1.8.3, comments included. It is [there
today](https://github.com/angular/angular.js/blob/master/src/ngMock/angular-mocks.js).

## ngRef, and how long it took

`ngRef` publishes a controller, or an element, into scope. I proposed it on 18
February 2016. It was discussed for two years and three months and fifty-eight
comments. On 1 June 2018 my pull request was closed. Four days later a
maintainer opened his own, rebased from mine with two changes, and merged that.
The directive shipped in 1.7.1 three days after that. His commit message:

> Thanks to @drpicox for the original implementation: PR #14080.

## Whose name is on the commit

There is no count of anything on this page, and this is why. On that project a
maintainer would take your pull request, rebase it, and land it himself:

> @drpicox I can also make these changes, so just tell me if you'll do it or I
> should. :)

Every commit of mine on the main branch was put there by a maintainer's hand,
and GitHub records almost all of my pull requests as never merged -- two of
them my own scaffolding for another. The merge button measures who pressed it.
What it does not measure, one of them wrote down while turning down a different
idea of mine:

> But totally 👍 for all the great ideas and work that you've been putting in
> to this and other features lately-ish. Really great stuff!

## Elsewhere

- [RxJS](https://github.com/Reactive-Extensions/RxJS/pull/1177) -- merged.
- [ducks-modular-redux](https://github.com/erikras/ducks-modular-redux) -- merged,
  and the canonical repository for the Ducks pattern lists two of my
  implementations in its README: `ducks-reducer` and `ducks-middleware`.
- Merged, too, into webpack's documentation site, `rollupify`, `kata-log`,
  `jest-runner-eslint` and `fetch-intercept`.

Forty pull requests to repositories that are not mine. Eleven of them merged.
