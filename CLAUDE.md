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
- `npm run coverage` — the same, counting the lines each test runs, into
  `coverage/`; `node tools/architecture-history.mjs` then puts it on the
  architecture page
- `npm run dev` — dev server
- `npm run build` — `npm run data`, typecheck, then a static build into `dist/`
- `npm run data` — fetch any finished year of open data that `public/data/`
  does not hold yet, and the year still running into an uncommitted
  `running.json`; runs before every build, asks for a finished year only when
  the year has changed and for the running one once a day, and never fails
  (`--year 2024` asks again, `--only no2` picks one)
- `node tools/preview-planets.mjs [seeds...]` — grow worlds and write them to
  `tools/planets.png`, so a person can look at them
- `node tools/architecture-history.mjs` — read the source at every commit
  of the main line that changed it, and what each one changed, into
  `public/data/architecture.json`: the history the architecture page plays
  and the changes page reads. The deploy runs it, with `npm run coverage`, on
  every push, with the whole history checked out; run it here only to see the
  page in dev. Its output is not committed back by the deploy
- `node tools/shape-report.mjs [sha]` — how the shape of the source moved
  from a commit (or the one before the last) to the last, as markdown: the
  deploy writes it into the summary of its run. To be read; the ratchet is
  the test
- `node tools/unrun.mjs` — after `npm run coverage`, what no test runs,
  function by function and line by line, under the question each file asks:
  nothing uses it (it has no purpose: remove it, or move it into the test that
  needs it), only a browser runs it (it is hard to test here: test it in a
  page, or move what it decides out of the browser), or the site uses it and
  no test runs it (a behaviour no test states: write it, or remove the code).
  Coverage is not a target; a line no test runs is a question. The deploy
  writes it into the summary of its run
- `node tools/mutate.mjs [sha]` — breaks the lines changed since a commit (or
  not committed yet, or in the last commit) one small change at a time —
  `===` into `!==`, `&&` into `||`, `true` into `false` — runs the tests that
  import each file, and prints what no test caught. Coverage says a line was
  run; this says whether running it was checked. The deploy writes it into
  the summary of its run
- `node tools/shoot-projects.mjs [names...]` — photograph the programs
  running on their pages into `public/projects/shots/`, for the cards; needs
  `npm run dev` running (`SITE=` if it is not on 5173); `THEME=dark` takes
  the dark ones, `name-dark.jpg`, which a card titled `"card dark"` shows
- `node tools/write-favicon.mjs [seed]` — grow one still world into
  `public/favicon.png`, the icon a browser has before the script runs

## Architecture

The top level says what this is: a frame, and the features standing in it.

- `src/platform/` — **the frame.** Everything that would still be here if
  every feature were deleted, and it never imports from `src/features/`.
  - `content/` — front matter, and `Site`: what is at an address, what a
    directory holds
  - `markdown/` — the small subset of markdown this site writes in, with
    ```flow, ```bars and ```math blocks drawn at build time
  - `command/` — what a command is, what running one asks of the page
    (`Outcome`), and that said as plain text: the contract the shell, the
    features, the programs and the flags agree on, kept apart from the shell
    so that the boxes everything needs need nothing that changes as often
  - `shell/` — the shell over a `Site`, and the commands that are about the
    site itself: `ls`, `cd`, `cat`, `find`, `grep`, `pwd`, `help`, `clear`;
    in `browser/`, the terminal: the prompt on the page, wired to it
  - `page/` — the whole HTML document, and the `<main>` inside it; in
    `browser/`, the move between pages, which writes a new `<main>` without a
    load
  - `browser/` — what everything in the browser shares: `el`, the programs on
    a page and the tools offered to an agent, and what moves
  - `agent/` — the tools that are about the site itself, `read` and `search`,
    as the shell's own commands are; what a tool is (`AgentTool`) and how
    every one answers is in `plugin/`, because a feature brings tools too
  - `data/` — open data kept a finished year at a time, and the year still
    running beside it: `YearlySource`, and the refresh that cannot lose what
    is already held
  - `charts/` — charts as plain SVG strings, drawn the same in node and the browser
  - `flags/` — trials a reader can switch on: `flags`, `?name=on`, and
    `data-flags` on the root (set before paint) for a stylesheet to look at.
    A feature adds one by declaring it; `trial: 0.5` puts it on for one
    reader in two, drawn once each and kept, until they choose for themselves
  - `analytics/` — the names GoatCounter events are counted under; the
    counting itself is `browser/countEvent`
  - `program/` — a demonstration as an input and an output: its still, its
    command, and (in `browser/`) its dials and its WebMCP tool, all from one
    `Program`
  - `testing/` — a test file run in the page the way Jest would run it, with
    its messages, for the examples that are about tests
  - `blueprint/` — a program drawn as boxes and wires, as Unreal draws them:
    `NodeKind` (typed inputs and outputs, a pure `run`), `PinType`, the
    `Blueprint` itself, its run (`evaluateBlueprint`, which keeps what did not
    change and waits for a file on its way), its text (`parseBlueprint`,
    `printBlueprint`), its tidying, its still, and the nodes every blueprint
    has: a dial, steps on tables, statistics, pictures (`paint/`). A feature
    brings the nodes about its own data, as `nodes` and `pinTypes`. Needs
    nothing but the escaping of markup, so everything can need it
  - `workbench/` — where a blueprint written in a page is worked on: in
    `browser/`, the canvas, the board, the menu, the text; mounted by
    `main.ts`, the one place that knows every feature's nodes
  - `browser/mountPlayer` — how anything that moves is played: only on screen,
    with a button to pause it, resting on its last frame, never for a reader
    who asked for less motion
- `src/features/` — **one folder each, and deleting the folder deletes the
  feature.** `world/`, `theme/`, `sky/`, `technical-debt/`,
  `developer-meetings/`, `headline/`, `air-quality/`, `weather/`, `sea/`, `next-word/`,
  `rocket/`, `packages/`, `fish-market/`, `lagoon/`, `maze/`, `first-network/`, `fibergochi/`, `portfolio/`, `architecture/`, `adventure/`, `post-tests/`, `thesis-results/`, `step-names/`, `bowling-kata/`, `tests-as-examples/`, `gherkin-genie/`, `small-steps/`, `guess-the-rule/`, `writings/`, `recipes/`. A feature owns everything about itself: its rules,
  its commands, its screen, its storage.
- `src/main.ts` — the composition root, and the only file allowed to know
  about more than one feature at a time.
- `content/` — the site, in markdown. A file is a page is a URL.
- `public/data/` — the open data the features keep, one file a station, one
  line a year. Written by `npm run data`, never by hand.
- `tools/` — things a person runs to look at something

See **`ARCHITECTURE.md`** for the diagrams: what the modules are and how they
talk to each other.

## Rules

- **TDD, the whole cycle.** Red, green, refactor. The refactor is not optional.
- **One export per file, and the file is named after it.** A file that needs a
  second export usually wanted to be two files. It counts values — functions,
  classes, constants — and a value's own types may travel with it. Things that
  only make sense together are one value: `WORK_WEEK`, `englishWorld`,
  `headerWorld`. `architecture.test.ts` counts them.
- **No two boxes need each other round in a circle.** A box is a folder of
  `src/platform/` or a feature; a circle between boxes cannot be drawn with its
  arrows pointing one way. The graph is read by the compiler, in
  `features/architecture/`, and the same test checks it. Nor do two files.
- **No feature imports another.** Where two go together, the composition
  (`main.ts`, `features/allFeatures.ts`) hands one what the other offers, as
  `skyFeature(turning)` does; the feature says what it needs in its own words.
- **The ratchet.** `src/architecture.ratchet.json` holds where the shape of the
  source stands — box arrows against stability, the deepest core, the tallest
  stack, the files with something to run that no test imports. None may get
  worse; one that gets better is written in, in the same commit.
- **The agent's harness.** `.claude/settings.json` holds two Claude Code
  hooks. After every edit to a file of the source, the agent is told what the
  history knows of it — how often it changed, what it changes with and
  whether a test holds what they agree on, what needs it, the tests that
  import it (`.claude/hooks/after-edit.mjs`). A commit is not let through,
  and a turn cannot end, while the type check or the tests are red — the
  history's checks read against the history as the deploy will write it, the
  work not committed yet as one more commit (`before-commit.mjs`,
  `stop-when-green.mjs`, both asking `green.mjs`; a state found green is
  remembered in `.git/`, and the same red is held at the end of a turn at
  most twice).
- **A contract no import states is held by a test.** Two files of different
  boxes that changed together twice with no arrow joining them need a test
  that imports both (`platform/page/browser/pageContract.test.ts` is the
  page's, `features/theme/browser/themeContract.test.ts` the theme's). Within
  a box, changing together is what makes it one; a pair whose agreement the
  compiler holds is listed in the test, with why. The history is
  `public/data/architecture.json`: the deploy checks it again once it has
  written it; here, `node tools/architecture-history.mjs` refreshes it.
- **A folder named `browser/` is the only place the DOM exists.** Everywhere
  else is plain node, and is tested there. This is what lets the same code
  render pages at build time and answer commands in the browser, and it is the
  one requirement that outranks the folder layout.
- `src/platform` must never import from `src/features`. The dependency only
  points one way.
- **A feature must load in node.** The build loads every feature for its
  stills and a tool loads them for their sources, so a feature never imports
  the browser's copy of the site: a program is handed it (`Surroundings`).
- A test asserts a claim about the world, not the shape of the code. When a
  test fails, first ask whether the claim was wrong — twice tonight it was.
- **No dependency that is not a requirement.** `eclipsi26` and `heatwave` ship
  with no `package.json` at all; this repo has three devDependencies that
  matter — Vite, TypeScript, vitest — beside their types, jsdom for the
  browser tests, and vitest's coverage reader (see `DECISIONS.md`), and zero
  runtime ones. Adding another needs a reason written down in `DECISIONS.md`.
- Comments say *why*. The code already says what.
