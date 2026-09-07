# Decisions, and the ones still open

Written the night of 6–7 September 2026. Each entry says what was decided and
why, so the reasoning survives longer than the memory of it.

---

## Decided

### The site is prerendered, and the content is in the HTML
The 2025 site was a terminal that built itself in JavaScript. It looked good
and no search engine could read a word of it. Whatever else changes, this does
not: markdown goes in, HTML comes out at build time.

### No framework, no runtime dependencies
`eclipsi26` and `heatwave` are live, useful and have no `package.json`. A
personal site does not need React. What it needs is that `src/core` stays
DOM-free, so the same functions render a page in node at build time and answer
a command in the browser afterwards.

### The terminal is a grammar, not a costume
Keep: a path, a prompt, autocompletion, everything at one address. Drop: the
16-colour EGA palette, the scanlines, the palette bar in the header. The
commands **navigate the document**; they do not open windows. Windows would put
the content back behind JavaScript, which is the thing this rebuild exists to
fix.

### The grid is the 2019 one
37rem column, generous vertical rhythm, one accent. The narrow measure is the
real asset: nothing superfluous fits in it, so the minimalism maintains itself.

### The planet is generated, not photographed
The avatar was an old photo. It is now the MGC filter pipeline of 1999 — raise
the land, work out the climate, choose the sea, paint it — run live, so the
mark on the page is a different world every visit and is itself the evidence
for the first entry in the work list.

The pipeline's order is asserted by a test: painting before the land exists
leaves one flat colour. Order is meaning, not style.

### Positioning: the role in the headline, the rarity underneath
"I design languages" is true and almost unhireable — perhaps four companies in
the world hire for it. The work is *platform* work, done five times in
twenty-five years, and the language design is the recurring **method**. So the
headline names the work and the prose keeps the searchable words.

---

## Open

### The noun in the headline
"I build ___ other engineers build on." Ruled out so far:

- **platforms** — in 2026 job ads this mostly means Kubernetes, CI/CD and
  internal developer platforms. A reader primed for that will expect Terraform.
- **what** — vague, and reads badly.
- **tools** — makes a compiler sound like a script.
- **infrastructure** — puts him in the SRE bucket.
- **substrate** — precise and obscure.
- **building blocks** — "build the building blocks" repeats itself.

**Current recommendation: foundations.** The junior reading of the word
("foundations" as "the basics") does not survive the sentence — "the
foundations other engineers build on" can only mean the architectural sense.
It keeps the building metaphor he reached for himself. The echo of *build*
reads as a chain rather than a stumble, because the two are far apart and the
second is a phrasal verb.

Runner-up worth trying out loud: **"I build to be built on."**

### The title colour
It should have some. A selector, remembered per reader, over a short list of
considered accents — not a colour picker.

### Dark ground
Not pure black. `#15181d` or thereabouts, with the title carrying a calm hue
rather than either shouting (`#88f`) or disappearing into the body text.

### The photograph
The generated planet is a better mark than an out-of-date photo, but for a
person reading a candidacy a recent face still helps. If one appears, it goes
in and the planet moves somewhere else on the page.
