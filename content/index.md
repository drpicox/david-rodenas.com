---
title: David Rodenas
summary: PhD. I build the foundations other engineers build on.
order: 0
---

# I build the foundations other engineers build on.

Five times, in five places, over twenty-five years: a filter pipeline, a
processor simulator's interconnect, a database kernel's task framework, a
retailer's front-end factory, and a travel platform's plugin kernel. Every
time, the users were engineers — and every time, somebody else's work plugged
into mine.

PhD, Barcelona. Platform engineering in research, in retail, and in travel
tech. I write every Saturday and I have not missed one since 2022.

## Five times

before 2000 :: **A university assignment.** A fractal planet generator built as a pipeline of composable filters -- icosahedron, fractalise, temperatures, colour, sea -- where the order is part of the meaning. I designed the pipeline, and that is what let the rest of the group split the work between them. Java 1.1.8 on MS-DOS: a plugin architecture, twenty-five years ago. It is still running, at the top of this page.
2005–08 :: **Barcelona Supercomputing Center.** CellSim, a simulator of the Cell processor: I built the base, the modularity and the message protocol its components talk through. Another engineer implemented the accelerator units against that design, and at least three outside groups later plugged in modules of their own. Also the ACOTES phase inside the Mercurium compiler -- serial C turned into streaming code -- 10,803 lines, sole author of the phase.
2008–09 :: **DAMA-UPC.** Made a graph database kernel concurrent: a lock-free buffer pool and a read/write lock of my own, and the task framework its Java API was driven through. 81.5 s to 10.1 s; 4.4× scaling where there had been none.
2014–15 :: **Desigual.** An internal front-end factory: a generator with nine sub-generators, 22 versioned components, and documentation that installs itself into every project it creates. It rewrote your source safely and repeatedly, in 2014, before AST tooling was something you could pick up. Six production apps adopted it. Another team forked it.
2017–26 :: **Travelport.** The plugin kernel, the devkit and the SDK documentation site a product line runs on. The docs cannot rot: every code sample in them compiles in the browser and runs against the real kernel. 22 packages, 396 releases, 32 breaking changes, no major version in three years.

The recurring method is the same one every time: when a platform gets hard to
use, I give it a language. A template compiler from XML to React with
reactivity tracked per variable (2018). A compiler from specifications written
in plain English into JUnit and Jest (2022). An expression language whose type
inference filters the dropdown, so an agent cannot write an expression that
does not typecheck (2025). And once,
[`commentDirectivesEnabled()`](https://github.com/angular/angular.js/pull/14850) --
merged into the AngularJS core by its maintainer, public API since 1.6, still
in the source today.

> Engineers are your customers.
