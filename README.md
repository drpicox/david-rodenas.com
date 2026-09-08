# david-rodenas.com

A static personal site, prerendered from markdown, with no runtime
dependencies.

```sh
npm install
npm test                          # 174 tests, all in plain node
npm run dev
npm run build                     # dist/ is the whole site
node tools/preview-planets.mjs    # grow six worlds, look at them
```

`CLAUDE.md` has the conventions, `ARCHITECTURE.md` has the diagrams and the
rules a test enforces, `DECISIONS.md` has the reasoning and the questions still
open.

## State — 8 September 2026

Replaces the live site. Small on purpose: the book, the essays, the AngularJS
work, the talks, the kata, two simulators, and the worlds — and a shell that
works.

### The shape of it

A frame, and the features standing in it. The top level says which is which,
and `src/architecture.test.ts` keeps it that way.

| | |
|---|---|
| `platform/content` | front matter, routes, `Site` — what is at an address and what a directory holds |
| `platform/markdown` | the subset of markdown the content uses, with images, `Term :: definition` and `::app` blocks |
| `platform/shell` | `ls`, `cd`, `cat`, `pwd`, `help`, `clear` over `Site`, plus history, completion and the `^K`/`^U`/`^Y` line editing |
| `platform/page` | one HTML document per page, `renderMain` shared with the browser, `schema.org/Book` for the book |
| `platform/plugin` | what a `Feature` is, and the `Signal` one uses to tell another something |
| `platform/browser` | the terminal, the navigation between pages, `el`, the charts |
| `features/world` | the MGC filter pipeline, the rasteriser, the mark in the header, the tab icon, the page with the dials |
| `features/theme` | light, dark, system: the command, the button, and the rule that weighs a reader's choice against a page's own |
| `features/sky` | two layers of stars, drifting on their own or driven by a hand on a world |
| `features/technical-debt`, `features/developer-meetings` | the two simulators |
| `content/` | home, the book, the essays, the code, the talks, the kata, the simulators, the worlds |
| `.github/workflows/deploy.yml` | build, test, and publish `dist/` as `drpicox.github.io` |

**Deleting a feature is deleting its folder and its line in `allFeatures.ts`.**
The frame never imports a feature, and the DOM exists only inside folders named
`browser/` — which is what lets the same code render a page in node at build
time and answer `ls` in a browser afterwards.

### Speed, and what was actually measured

The worlds page used to stutter and to get worse when zoomed. Three things were
changed, and they are not worth the same:

| | |
|---|---|
| **The sky, and it was the sky** | Two hundred `radial-gradient`s over the whole viewport, slid every frame with `background-position`, so the browser rasterised all of them again every frame — and a zoom multiplies the device pixels it has to do that to, which is why zooming made it worse. They now move with `translate3d` on promoted layers: drawn once, then shifted by the compositor. **Mechanism verified, magnitude not measured** — see below. |
| **The rasteriser, modestly** | It kept asking for half a megabyte of pixels and half a megabyte of depth every frame, and made an array per corner and per face besides. Now it keeps its buffers and a canvas hands over its own pixels. Measured over 600 frames of the header's world: **106 collections → 12**, and **1.70 ms → 1.57 ms** a frame. |
| **The tab icon, not at all** | `toDataURL` looked like main-thread work worth moving. Measured: **0.8 ms, once every 400 — a fifth of one per cent** — and `toBlob` only moves a quarter of that. The change was taken back out and the one line restored. |

The sky is the one that mattered and the one without a number, because a frame
rate cannot be measured from an automated tab: the tab is hidden while a script
drives it, so `requestAnimationFrame` never fires. To measure it on your own
machine, at your own zoom, open `/worlds/` and paste this, then drag the world:

```js
let last = performance.now(), slow = 0, n = 0;
(function tick(now) {
  const dt = now - last; last = now; n += 1;
  if (dt > 20) slow += 1;
  if (n === 300) console.log(`${slow} of 300 frames over 20ms`);
  requestAnimationFrame(tick);
})(performance.now());
```

Then set `background-position` back on `body::before` in the devtools and do it
again. That comparison is the missing number, and it belongs to whoever has the
GPU.

### Publishing

Pushing to `main` runs the workflow, which replaces everything in
`drpicox/drpicox.github.io` with `dist/`. It needs a repository secret named
`DEPLOY_TOKEN`: a fine-grained personal access token with *Contents: read and
write* on `drpicox.github.io`. `CNAME` and `.nojekyll` live in `public/`, so
the built directory is complete on its own.

### Not done

- `work/` — the five platforms, one page each, as they are written
- the bigram demo
- a photograph, if one appears

### Where the content comes from

Every figure on the site is traceable to a source, and nothing goes on a page
that is not. The map of those sources is personal, so it lives in
`SOURCES.local.md`, which is not committed.
