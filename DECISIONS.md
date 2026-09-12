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

The climate has the shape of the 1999 `PosarTemperatura`, read from the
source on 7 September 2026 after the author noticed the summits away from the
poles were not white: warmth falls in a straight line with height above the
sea, to a summit number below freezing, plus a latitude term. Height alone
makes a summit white, which is what the Himalaya and the Teide do. The paint
stayed this site's own: the 1999 table by temperature band and surface type
was ported, looked at, and put back — the author preferred these colours. The
surface type of `FractalRadialTexturat` still rides through the subdivision,
unused, for whoever wants to mottle the ground with it. The sea runs before
the climate so that the lowest point is sea level.

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
stars are two tiled layers the size of the viewport whose background slides,
the way a sky does behind a turning world: a turn about the axis slides them
sideways, a tilt up or down, and left alone they drift, by a CSS animation
until the worlds program takes over. The far layer moves at 0.6 of the near
one and its tile is 0.6 of the near one's, so both wrap on the same step and
the loop is invisible. The tiles are large (1600 × 1000 and 960 × 600) with
one star per cell of a jittered grid, drawn once from a seeded generator, so
neither a repeat nor an empty patch shows. Rotating the sky in the plane of
the screen was the first try, and it was the wrong axis; sliding a layer
larger than the viewport was the second, and it slid off the screen. The sky
goes with the hand, not against it, because that is what felt right.

The world has inertia: let go while moving and it keeps the hand's pace,
losing it with a time constant of 1.4 seconds until it is back at its idle
turn, the sky going with it. Stop before letting go and it stops. It is the
one exception, and it is the page that earns it.

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

### Code is coloured at build time, by a tokeniser written here

The pages with code on them — the AngularJS one, the teaching one — read
better with the strings and keywords picked out, and David asked for it.
The usual answer is a highlighter library. Prism and highlight.js are runtime
dependencies, and the browser would have to run them over every `<pre>`; the
whole point of this site is that nothing runs in the browser that was not
written here, and that a page is finished before any script arrives.

So the colouring is done once, at build time, by `platform/markdown/highlight`:
a small tokeniser that knows the two languages the content is written in,
JavaScript and HTML, and marks strings, comments, keywords, numbers, tags and
attributes with a `<span>` each. It is a few dozen lines with tests, it ships
as HTML and a handful of CSS rules, and a language it does not know is left
plain. A fence names its language — ```` ```js ````, ```` ```html ```` — or it is
left alone, which is what the ASCII diagram on the teaching page wants.

What it does not try to be: a general highlighter. Regular expressions,
template-literal interpolation, JSX and every other language are out of scope
until a page needs them, and a page that needs them gets a token added, with a
test, not a library.

### Diagrams are drawn at build time, by a layout engine written here

The teaching page needed a flowchart, and an ASCII one in a `<pre>` was hard
to read and David said so. Mermaid is the obvious tool and it is two and a
half megabytes in the browser, with d3, dagre and cytoscape inside it — the
opposite of this site. Rendering Mermaid at build time needs a headless
browser as a dependency, which is heavier still.

So `platform/markdown/flow/` is a small layered-graph layout of its own: a
parser for a subset of Mermaid's flowchart syntax (`A[label] --> B`,
`-->|label|`, `TD`/`LR`), so a diagram written here reads the same there;
ranks by longest path, a waypoint for every row an edge skips so an arrow
bends round a box rather than through it, rows ordered by the barycentre of
their neighbours, boxes pulled towards their neighbours and pushed apart
where they overlap; and inline SVG coloured by the page's own variables, so
it follows the theme. About two hundred lines, twenty-two tests, nothing in
the browser. A ```` ```flow ```` fence is a diagram; every other fence is a
listing.

What it does not do, on purpose: subgraphs, shapes other than a box, edge
styles, cycles. A page that needs one of those gets it added with a test.

### The grammar has to be seen: the quiet terminal
Decided 12 September 2026. "The terminal is a grammar, not a costume" stayed
true and nobody noticed the terminal: one grey line at the end of the page,
read as a caption. A first attempt (`terminal-at-hand`) stuck the prompt to
the bottom of the window with a grip and a blur, and read as a web page with
a terminal bolted on. The answer is not more terminal but the grammar made
visible, in the bones of the page and not on its skin — the shuttle keeps its
distance without looking like it is keeping its distance.

**Two voices.** The machine speaks in the monospace and speaks first: the
name, `~ $ ls` and the names it printed, the command that printed the page,
the listings, the footer, the prompt. The author speaks in the text face,
inside `<main>`. The prose is *not* monospace: two thousand words are read
and not typed, and the 2019 measure was drawn for a text face. So the frame
is set in the machine's type and the words in the author's, and the eye
learns in one screen which is which.

**The page is a session.** It opens with what `ls` printed at the root —
`README.md`, then the directories with their slashes — goes on with the
command that printed the page, `cat README.md` at home and `cd x && cat
README.md` elsewhere, prints a directory's listing at its own prompt as `ls`
would, name first, and ends with a prompt: the last line of the page, after
the footer, where a session ends. Arriving on a page clears the shell's
screen, because the page itself now says which command printed it.

**The cursor is in the HTML.** A block, `1ch` wide, in the prompt from the
first paint; an outline while the prompt is not focused, the way a terminal
shows the window that is not being typed into; solid and blinking when it
is. It is painted by difference, so it is ink on paper in either theme and
the character under it shows through inverted. It is shown only on a page
the head has marked as scripted (`html.js`), because a prompt that does
nothing is a lie — and the head has already caught whatever was typed before
the script arrived, so the cursor is not lying either. After it, in grey,
the rest of the line the reader is probably typing, fish-style: what was
typed before wins over what could be completed, `→` takes it, and an empty
line is offered `help`.

**What "not a costume" turned out to require:** the column is 72 of the
machine's columns (`72ch`), within a few pixels of the 2019 measure; the
rules are hairlines; the theme button is a bare glyph; no ligatures in the
monospace, because a terminal shows `->` as two characters and the cursor is
placed by counting them; no fade on the prompt, because a cursor that
arrives is a cursor that was not there. Nothing else was added. No window
chrome, no phosphor, no scanlines, no box-drawing.

**Kept on purpose:** the world in the header — a 2026 terminal shows images
inline, and the mark is the site's; the navy; the 37rem-ish measure; the
three-line headline; the theme feature exactly as it was, both themes
excellent because the palette did not change.

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
