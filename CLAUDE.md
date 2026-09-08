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

The top level says what this is: a frame, and the features standing in it.

- `src/platform/` — **the frame.** Everything that would still be here if
  every feature were deleted, and it never imports from `src/features/`.
  - `content/` — front matter, and `Site`: what is at an address, what a
    directory holds
  - `markdown/` — the small subset of markdown this site writes in
  - `shell/` — the shell over a `Site`, and the commands that are about the
    site itself: `ls`, `cd`, `cat`, `pwd`, `help`, `clear`
  - `page/` — the whole HTML document, and the `<main>` inside it
  - `browser/` — the terminal, the navigation between pages, and `el`
- `src/features/` — **one folder each, and deleting the folder deletes the
  feature.** `world/`, `theme/`, `sky/`, `technical-debt/`,
  `developer-meetings/`. A feature owns everything about itself: its rules,
  its commands, its screen, its storage.
- `src/main.ts` — the composition root, and the only file allowed to know
  about more than one feature at a time.
- `content/` — the site, in markdown. A file is a page is a URL.
- `tools/` — things a person runs to look at something

See **`ARCHITECTURE.md`** for the diagrams: what the modules are and how they
talk to each other.

## Rules

- **TDD, the whole cycle.** Red, green, refactor. The refactor is not optional.
- **One export per file, and the file is named after it.** A file that needs a
  second export usually wanted to be two files.
- **A folder named `browser/` is the only place the DOM exists.** Everywhere
  else is plain node, and is tested there. This is what lets the same code
  render pages at build time and answer commands in the browser, and it is the
  one requirement that outranks the folder layout.
- `src/platform` must never import from `src/features`. The dependency only
  points one way.
- A test asserts a claim about the world, not the shape of the code. When a
  test fails, first ask whether the claim was wrong — twice tonight it was.
- **No dependency that is not a requirement.** `eclipsi26` and `heatwave` ship
  with no `package.json` at all; this repo has three devDependencies and zero
  runtime ones. Adding a fourth needs a reason written down in `DECISIONS.md`.
- Comments say *why*. The code already says what.
