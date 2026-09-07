# david-rodenas.com

A static personal site, prerendered from markdown, with no runtime
dependencies.

```sh
npm install
npm test                          # 123 tests, all in plain node
npm run dev
npm run build                     # dist/ is the whole site
node tools/preview-planets.mjs    # grow six worlds, look at them
```

`CLAUDE.md` has the conventions, `DECISIONS.md` has the reasoning and the
questions still open.

## State — 7 September 2026

The first version that can replace the live site. Small on purpose: the book,
the essays, the kata, two simulators, and the worlds — and a shell that works.

### Done

| | |
|---|---|
| `core/markdown` | the subset of markdown the content uses, with images and `::app` blocks |
| `core/content` | front matter, routes, `Site` — what is at an address and what a directory holds |
| `core/planet` | the MGC filter pipeline and a sphere renderer |
| `core/shell` | `ls`, `cd`, `cat`, `pwd`, `help`, `clear`, `theme`, history and completion, over `Site` |
| `core/simulators` | technical debt, and a developer's week of meetings |
| `core/site` | one HTML document per page, `renderMain` shared with the browser, navigation from the content, `schema.org/Book` for the book |
| `ui/` | the spinning mark and its favicon, the prompt, the theme, in-page navigation, and three programs drawn in plain DOM and SVG |
| `content/` | home, the book, the essays, the kata, the simulators, the worlds |
| `.github/workflows/deploy.yml` | build, test, and publish `dist/` as `drpicox.github.io` |

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
