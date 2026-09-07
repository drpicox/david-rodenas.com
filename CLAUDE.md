# david-rodenas.com — conventions

A static personal site with **no runtime dependencies**. Vite, TypeScript and
vitest are devDependencies; nothing ships to the browser that is not written
here.

## Why it is built this way

The site it replaces (2025) rendered everything in JavaScript at runtime, so
search engines saw an empty page. That is the one requirement that outranks
taste: **the content is in the HTML**. Everything below follows from it.

## Before writing any content

Read **`SOURCES.local.md`** first. It maps where the verified material lives
and, more importantly, lists what must never be claimed. Its companion
**`HISTORY.local.md`** records the ten versions of this site since 2013 — their
palettes, their type, their content, and what survived each rewrite — including
the stylesheet of the 2019 one, which is the design this site inherits. Both
are deliberately uncommitted, so neither will be in a fresh clone.

**Nothing goes on a page that is not verified there.** When a figure cannot be
traced, write the weaker sentence.

## Commands

- `npm test` — vitest, all of it
- `npm run dev` — dev server
- `npm run build` — typecheck, then a static build into `dist/`
- `node tools/preview-planets.mjs [seeds...]` — grow worlds and write them to
  `tools/planets.png`, so a person can look at them
- `node tools/write-favicon.mjs [seed]` — grow one still world into
  `public/favicon.png`, the icon a browser has before the script runs

## Architecture

- `src/core/` — **no DOM, ever.** Tested in plain node. Everything the site
  knows how to do lives here, which is what lets the same code render pages at
  build time and answer commands in the browser.
  - `markdown/` — the small subset of markdown this site writes in
  - `content/` — front matter, and `Site`: what is at an address, what a
    directory holds
  - `planet/` — the 1999 MGC filter pipeline (an icosahedron, fractalised
    by midpoint displacement, with the sea as a minimum radius) and a
    flat-shaded rasteriser with a depth buffer
  - `shell/` — the commands, over the same `Site`
  - `bigrams/` — the language model of the demo
- `src/ui/` — the only code that touches the DOM
- `content/` — the site, in markdown. A file is a page is a URL.
- `tools/` — things a person runs to look at something

## Rules

- **TDD, the whole cycle.** Red, green, refactor. The refactor is not optional.
- **One export per file, and the file is named after it.** A file that needs a
  second export usually wanted to be two files.
- `src/core` must never import from `src/ui`. The dependency only points one
  way, and the tests in node are what keep it honest.
- A test asserts a claim about the world, not the shape of the code. When a
  test fails, first ask whether the claim was wrong — twice tonight it was.
- **No dependency that is not a requirement.** `eclipsi26` and `heatwave` ship
  with no `package.json` at all; this repo has three devDependencies and zero
  runtime ones. Adding a fourth needs a reason written down in `DECISIONS.md`.
- Comments say *why*. The code already says what.
