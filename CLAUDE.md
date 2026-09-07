# david-rodenas.com — conventions

A static personal site with **no runtime dependencies**. Vite, TypeScript and
vitest are devDependencies; nothing ships to the browser that is not written
here.

## Why it is built this way

The site it replaces (2025) rendered everything in JavaScript at runtime, so
search engines saw an empty page. That is the one requirement that outranks
taste: **the content is in the HTML**. Everything below follows from it.

## Commands

- `npm test` — vitest, all of it
- `npm run dev` — dev server
- `npm run build` — typecheck, then a static build into `dist/`
- `node tools/preview-planets.mjs [seeds...]` — grow worlds and write them to
  `tools/planets.png`, so a person can look at them

## Architecture

- `src/core/` — **no DOM, ever.** Tested in plain node. Everything the site
  knows how to do lives here, which is what lets the same code render pages at
  build time and answer commands in the browser.
  - `markdown/` — the small subset of markdown this site writes in
  - `content/` — front matter, and `Site`: what is at an address, what a
    directory holds
  - `planet/` — the MGC filter pipeline, and a sphere renderer
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
