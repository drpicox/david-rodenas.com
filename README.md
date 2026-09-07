# david-rodenas.com

A static personal site, prerendered from markdown, with no runtime
dependencies.

```sh
npm install
npm test                          # 43 tests, all in plain node
npm run dev
node tools/preview-planets.mjs    # grow six worlds, look at them
```

`CLAUDE.md` has the conventions, `DECISIONS.md` has the reasoning and the
questions still open.

## State — 7 September 2026

This is the foundation, not the finished site. What exists is tested; what does
not exist is listed honestly below.

### Done

| | |
|---|---|
| `core/markdown` | the subset of markdown the content uses, 17 tests |
| `core/content` | front matter, routes, `Site` — what is at an address and what a directory holds, 11 tests |
| `core/planet` | the MGC filter pipeline and a sphere renderer, 15 tests |
| `tools/` | a PNG writer and a preview sheet, so worlds can be judged by eye |

### Not done

- `src/ui/` — nothing yet: the canvas that spins the planet, the shell, the
  bigram demo
- the Vite plugin that emits one HTML file per content file
- `content/` — the writing itself: the five platforms, whoami, the demos,
  the essays, contact
- the stylesheet
- the GitHub Actions deploy

### Where the content comes from

Every figure on the site is traceable to a source, and nothing goes on a page
that is not. The map of those sources is personal, so it lives in
`SOURCES.local.md`, which is not committed.
