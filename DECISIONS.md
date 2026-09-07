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

### The colour is navy, and there is no selector
Decided 7 September 2026, the afternoon. A picker over five accents was built
and then removed: every choice on the page is one more thing that is not the
content. The navy is the 2019 blue, lifted so it carries links on the dark
ground as well.

### The first published version says three things, and keeps what was alive
The book, the essays, and what the mark in the header is. The five platforms
and the method underneath them came out: written as a list, they read as a CV,
and this is not a CV. They come back when each has a page of its own that is
worth reading, under `work/`, one file at a time.

What the 2025 site had that existed nowhere else stays: the Bowling Game Kata
with its slides, and the two simulators, rewritten without React or a chart
library — the arithmetic in `core/simulators`, tested; the drawing in
`ui/apps`, as inline SVG.

The intro line under the headline is the 2015 one, brought back: *computer
enthusiast, doctor and engineer*, plus the vice-deanship, which is verified.

The book page is the only record of the book on the open internet — it is in
no library catalogue — so it carries `schema.org/Book` markup, read from the
front matter.

### Navigation is `ls /`
The header prints the directories at the root, by name, in the author's
order. Adding a section is adding a directory; there is no list of routes to
keep in step.

### The prompt is real, or it is not there
The 2025 site pretended: a line that looked typed and nothing to type into.
Now every page ends in a prompt wired to a shell in `core/shell` — `ls`, `cd`,
`cat`, `pwd`, `help`, `clear`, `theme`, the same seven the 2025 site had —
over the same markdown the pages were rendered from, shipped to the browser as
a virtual module. `cd` moves the page; `cat` prints one here. The shell has no
DOM in it, so its tests run in node. Without JavaScript the prompt stays
hidden, because a prompt that does nothing is a lie.

The theme button in the header runs `theme` through that shell, so pressing
it and typing it are the same thing.

Once the script is there, a page change is not a page load. The markdown and
the renderer are already in the browser, so a link or a `cd` swaps what is
inside `<main>` (`renderMain`, the same function the build used), pushes the
URL, and the header, the planet and the shell stay where they were. The
programs on the old page are stopped and the ones on the new page started.
Anything not in the site — a PDF, Medium — is a real link, and the back button
works because it is `pushState`, nothing cleverer.

For the first load, and for anything that still has to be a real load, the
shell carries itself over: what it had printed and the rest of the line
(`cd book && cat *` finishes on `/book/`), through session storage. And a
two-line script in the head keeps every key pressed before the bundle
arrives, so typing into a page that is still loading loses nothing.

### A page may insist on its own sky
`theme: dark` and `sky: stars` in the front matter, and the worlds page is
night whatever the reader chose: the attributes are in the HTML, so it opens
dark without waiting for a script, and the theme button changes the reader's
choice for every other page without lifting the night from this one. The
stars are two layers of tiled radial gradients, one of them breathing. It is
the one exception, and it is the page that earns it.

### The favicon is the planet
The same world, 32 pixels wide, painted into the tab's icon a few times a
second from the same rotation. Chrome and Firefox turn it; Safari shows the
first frame. Until the script runs there is `favicon.png`: a still world,
grown with the header's recipe from seed 1999 by `tools/write-favicon.mjs`.
It is all that bookmarks, the history and a background tab ever see, so it
had to be a planet too — the triangle inherited from the 2025 site is gone.

### One external script: GoatCounter
Analytics have to come from somewhere, and the 2025 site already counted at
`drpicox.goatcounter.com`. It is the one thing on the page not written here;
it loads last, asynchronously, and the page does not depend on it.

### A `::name` line in the markdown is where a program mounts
The words around it are still words, so the page reads whole without the
program; the program gets a `div` to grow into. Three so far: the two
simulators and the worlds.

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
It keeps the building metaphor he reached for himself.

The verb is now **lay**, not *build*: "I lay the foundations" is the idiom, and
it removes the *build… build* echo instead of arguing that it read as a chain.
The headline is set on three lines, broken by hand — *I lay / the foundations
/ other engineers build on.* — so the first line is two words and the weight
falls on the last.

Runner-up worth trying out loud: **"I build to be built on."**

### Dark ground
Not pure black. `#15181d` or thereabouts, with the title carrying a calm hue
rather than either shouting (`#88f`) or disappearing into the body text.

### The photograph
The generated planet is a better mark than an out-of-date photo, but for a
person reading a candidacy a recent face still helps. If one appears, it goes
in and the planet moves somewhere else on the page.
