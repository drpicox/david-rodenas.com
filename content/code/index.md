---
title: Two public APIs of AngularJS are mine
summary: One pull request merged into the AngularJS compiler, two provider options still in the framework's final release, and the benchmark written to argue for them.
order: 3
---

# Two public APIs  
of AngularJS  
are mine.

In 2016 I opened thirteen pull requests against `angular/angular.js`. One of
them was merged, by a core maintainer, on 8 August 2016: 1,115 lines across
eight files, adding `$compileProvider.commentDirectivesEnabled()` and
`$compileProvider.cssClassDirectivesEnabled()`. The commit message says what
they were for: *this can result in a compilation speed-up of around 10%*.

Both are still there. They shipped in AngularJS 1.5.9 and 1.6.0, and they are
in 1.8.3 -- the last release the framework ever had, in April 2022. They are
[in the compiler](https://github.com/angular/angular.js/blob/master/src/ng/compile.js)
today, and the argument that got them in is
[in the pull request](https://github.com/angular/angular.js/pull/14850).

## The benchmark is the part I would keep

A maintainer asked, reasonably, for numbers he could check. So I wrote a
benchmark for the compiler in benchpress -- AngularJS's own measuring harness --
and posted what it said: about 12% off compiling Bootstrap's carousel template,
about 10% off its theme. Ten per cent is what this change is worth, and I have
seen much larger figures attributed to me for it. The large number is real, but
it belongs further down this page and to a different change.

The benchmark outlasted the argument. `benchmarks/bootstrap-compile-bp/` is
still in the repository, and so is a second one I wrote for `ngClass`. So is
the documentation: the *Disable comment and css class directives* section of
AngularJS's **Running in Production** guide is mine.

## ngRef, which is mine and is not

The `ngRef` directive shipped in AngularJS 1.7.1 in June 2018 -- a way to
publish a controller or an element into scope. I proposed it in February 2016.
It took two and a quarter years and fifty-eight comments, and in the end a
maintainer rebased my work, changed two things about it, and merged that
instead. The commit is his. The message is this:

> Thanks to @drpicox for the original implementation: PR #14080.

## The hundredfold one, which is not mine either

The bigger number is not in the compiler. It is in `ngClass`, and I spent
months on it, and all three of those pull requests were closed unmerged.

The reason it was worth months is the shape of the problem rather than the size
of the patch. `ng-class="{friendly: user.friends}"` needs exactly one thing
from `user.friends`: whether it is there. AngularJS was deep-watching it --
copying the whole object graph behind it and comparing the copy -- on every
digest, for every element. The cost was proportional to your data. It should
have been proportional to the number of class names, and that is what the fix
made it.

What shipped, in 1.6.1, was written by another maintainer, on top of mine. His
commit message:

> In large based on #14404. Kudos to @drpicox for the initial idea and a big
> part of the implementation.

Then he asked for a benchmark, so I wrote that too, and it is still in the
repository. On a single element bound to a large object -- the pathological
case, and a common one -- it measured **more than a hundred times faster**:
about 1.5 milliseconds a digest down to between 0.02 and 0.08. On long lists,
five to ten times, from seven or thirteen milliseconds down to about one.

Those are my numbers on my own benchmark and nobody reproduced them. And the
same benchmark says that on data already written the careful way, by hand, the
new code is about 25% *slower*. Which is the honest summary of the whole thing:
it does automatically what an experienced Angular programmer would have done
manually, and it is worth having for the same reason type inference is.

One `ngClass` change is mine outright and unglamorous: a fix for watching an
array with an object inside it, in 1.5.5, backported to 1.4.11.

## The count, plainly

Thirteen pull requests to the framework. **One merged.** Six commits on the
default branch. Four releases carrying code I wrote, and two more crediting it
by name. That is a smaller number than a CV would like and a larger one than
most people get, and the reason it is worth a page is not the arithmetic: it is
that I went into the compiler of a framework I did not own, measured the thing
I thought was slow, and convinced the people who did own it.

## Elsewhere

- [RxJS](https://github.com/Reactive-Extensions/RxJS/pull/1177) -- merged.
- [ducks-modular-redux](https://github.com/erikras/ducks-modular-redux) -- merged,
  and the canonical repository for the Ducks pattern lists two of my
  implementations in its README: `ducks-reducer` and `ducks-middleware`.
- Merged, too, into webpack's documentation site, `rollupify`, `kata-log`,
  `jest-runner-eslint` and `fetch-intercept`.

Forty pull requests to repositories that are not mine. Eleven of them merged.
