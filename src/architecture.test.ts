import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { boxCycles } from "./features/architecture/boxCycles";
import { COMPOSITION } from "./features/architecture/COMPOSITION";
import { readGraph } from "./features/architecture/readGraph";
import { readHistory } from "./features/architecture/readHistory";
import { readSources } from "./features/architecture/readSources";
import { type Shape, shapeOf } from "./features/architecture/shapeOf";
import { snapshotOf } from "./features/architecture/snapshotOf";
import { stronglyConnectedOf } from "./features/architecture/stronglyConnectedOf";
import { unheldCouplingsOf } from "./features/architecture/unheldCouplingsOf";
import { valueExportsOf } from "./features/architecture/valueExportsOf";

const SRC = new URL(".", import.meta.url).pathname.replace(/\/$/, "");
const ROOT = dirname(SRC);

/** The source as the compiler reads it: the same graph the architecture page draws. */
const every = readSources(SRC);
const graph = readGraph(every);
const textOf = new Map(every.map((source) => [source.path, source.text]));
const sources = every.filter((source) => !source.path.endsWith(".test.ts")).map((source) => source.path);
/** The shipped source only: a test may reach wherever it has to, and its arrows are not the architecture's. */
const shipped = { modules: graph.modules.filter((module) => !module.test), dependencies: graph.dependencies.filter((dependency) => !dependency.from.endsWith(".test.ts")) };
const importsOf = (file: string) => graph.dependencies.filter((dependency) => dependency.from === file).map((dependency) => dependency.to);

/**
 * The file with its comments and its strings taken out, so that a page which
 * writes `document.documentElement` into a `<script>` it is generating, or a
 * comment that happens to say the word, is not mistaken for code that touches
 * the DOM. One pass, in order, because three passes with three patterns get
 * the nesting wrong — a double-quoted attribute inside a single-quoted string
 * was enough to break it.
 */
function code(text: string): string {
  let kept = "";
  let closing = "";
  for (let at = 0; at < text.length; at += 1) {
    const here = text[at] ?? "";
    const next = text[at + 1] ?? "";
    if (closing) {
      if (here === "\\" && closing !== "*/" && closing !== "\n") at += 1;
      else if (text.startsWith(closing, at)) {
        at += closing.length - 1;
        closing = "";
      }
      continue;
    }
    if (here === "/" && next === "*") closing = "*/";
    else if (here === "/" && next === "/") closing = "\n";
    else if (here === '"' || here === "'" || here === "`") closing = here;
    else kept += here;
  }
  return kept;
}

/**
 * These are claims about the site, not about taste. Each one, broken, breaks
 * something a reader would notice — a build that crashes in node, a frame that
 * cannot be read without knowing the features, a feature nobody installs.
 */
describe("the shape of the source", () => {
  // The browser entry is a browser file by definition; it is the page's first line of script.
  // This file names the globals to look for, so it cannot be one of the files looked at.
  const BROWSER = /(^|\/)browser\//;
  const EXEMPT = ["main.ts", "architecture.test.ts"];
  const GLOBALS = /\b(document|window|localStorage|sessionStorage|navigator)\b/;

  it("keeps the DOM inside folders named browser/", () => {
    const trespassing = sources
      .filter((file) => !BROWSER.test(file) && !EXEMPT.includes(file))
      .filter((file) => GLOBALS.test(code(textOf.get(file) ?? "")));
    expect(trespassing).toEqual([]);
  });

  it("never lets the frame import a feature", () => {
    const wrongWay = sources.filter((file) => file.startsWith("platform/")).filter((file) => importsOf(file).some((target) => target.startsWith("features/")));
    expect(wrongWay).toEqual([]);
  });

  // This is the one that would actually crash: the build renders every page in node.
  it("keeps the whole build-time renderer clear of the browser", () => {
    const seen = new Set<string>();
    const queue = ["platform/page/renderDocument.ts"];
    while (queue.length > 0) {
      const file = queue.pop();
      if (!file || seen.has(file)) continue;
      seen.add(file);
      queue.push(...importsOf(file));
    }
    const wouldCrash = [...seen].filter((file) => BROWSER.test(file) || GLOBALS.test(code(textOf.get(file) ?? "")));
    expect(wouldCrash).toEqual([]);
    expect(seen.size).toBeGreaterThan(5);
  });

  // The build loads the features for their stills, and a tool loads them for their sources.
  it("keeps every feature loadable in node: the browser's copy of the site is handed to a program, never imported", () => {
    const reaching = sources.filter((file) => file.startsWith("features/")).filter((file) => importsOf(file).includes("platform/browser/siteInBrowser.ts"));
    expect(reaching).toEqual([]);
  });

  // A circle between boxes cannot be drawn with its arrows pointing one way, and none of its boxes can be read without the others.
  it("has no boxes that need each other round in a circle", () => {
    expect(boxCycles(shipped)).toEqual([]);
  });

  // Nor files: none of a circle of files can be tested, or taken out, without the rest.
  it("has no files that need each other round in a circle", () => {
    const needs = new Map<string, string[]>();
    for (const { from, to } of shipped.dependencies) needs.set(from, [...(needs.get(from) ?? []), to]);
    const circles = stronglyConnectedOf(shipped.modules.map((module) => module.path), (file) => needs.get(file) ?? []).filter((circle) => circle.length > 1);
    expect(circles).toEqual([]);
  });

  // Deleting a feature's folder deletes the feature only if no other feature needs anything in it: what joins two features is for the composition to say.
  it("never lets a feature import another: only the composition knows more than one", () => {
    const featureOf = (file: string) => /^features\/([^/]+)\//.exec(file)?.[1];
    const crossing = sources.filter((file) => !COMPOSITION.includes(file)).flatMap((file) =>
      importsOf(file)
        .filter((target) => featureOf(file) !== undefined && featureOf(target) !== undefined && featureOf(target) !== featureOf(file))
        .map((target) => `${file} -> ${target}`),
    );
    expect(crossing).toEqual([]);
  });

  // Its types may travel with it: an interface beside the function it describes is one thing, not two.
  it("exports one value a file, and names the file after it", () => {
    const crowded = sources.map((file) => ({ file, values: valueExportsOf(textOf.get(file) ?? "") })).filter(({ values }) => values.length > 1);
    expect(crowded.map(({ file, values }) => `${file}: ${values.join(", ")}`)).toEqual([]);
  });

  it("installs every feature there is a folder for", () => {
    const folders = readdirSync(join(SRC, "features"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    const list = readFileSync(join(SRC, "features/allFeatures.ts"), "utf8");
    expect(folders.filter((folder) => !list.includes(`./${folder}/`))).toEqual([]);
    expect(folders.length).toBeGreaterThan(1);
  });

  it("draws every feature in the diagrams, so they stay true", () => {
    const folders = readdirSync(join(SRC, "features"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    const drawn = readFileSync(join(ROOT, "ARCHITECTURE.md"), "utf8");
    expect(folders.filter((folder) => !drawn.includes(folder))).toEqual([]);
  });
});

/**
 * A ratchet turns one way. The measures in `architecture.ratchet.json` are
 * where the source stands, and none may get worse; one that gets better is
 * written in, in the same commit, so that it cannot be lost again. It starts
 * where the source is, not at a line drawn by taste, and it asks nobody to
 * remember anything: whatever makes the shape worse is told so, by name.
 */
describe("the ratchet on the shape of the source", () => {
  const RATCHET = join(SRC, "architecture.ratchet.json");
  const held = JSON.parse(readFileSync(RATCHET, "utf8")) as Record<string, number>;
  const now = shapeOf(snapshotOf(graph));
  const measures = Object.keys(now) as (keyof Shape)[];

  it("holds every measure of the shape, and nothing else", () => {
    expect(Object.keys(held).sort()).toEqual([...measures].sort());
  });

  it("lets no measure get worse than it holds", () => {
    const worse = measures.filter((name) => now[name] > (held[name] ?? 0)).map((name) => `${name}: ${held[name]} held, ${now[name]} now`);
    expect(worse, "the shape of the source got worse").toEqual([]);
  });

  it("keeps every gain: a measure that got better is written into the ratchet", () => {
    const better = measures.filter((name) => now[name] < (held[name] ?? 0)).map((name) => `${name}: ${held[name]} held, ${now[name]} now — write ${now[name]} into src/architecture.ratchet.json`);
    expect(better, "a gain is kept by writing it into the ratchet").toEqual([]);
  });
});

/**
 * Two files that keep changing together with no arrow between them share
 * something the compiler cannot see: the page the build writes and the script
 * that reads it agree on its markup, and no import says so. Such a contract
 * is held when a test imports both sides, so that breaking it fails. What
 * changed together is read from the history the deploy writes at every push,
 * and reads again here once it is written; on a desk, from whatever
 * `node tools/architecture-history.mjs` wrote last.
 */
describe("the contracts no import states", () => {
  // The history the deploy writes; or, asked by name, one written just now, which a check before a commit wants.
  const history = readHistory(readFileSync(process.env["ARCHITECTURE_HISTORY"] ?? join(ROOT, "public/data/architecture.json"), "utf8"));
  /** Pairs whose agreement the compiler already holds, each with why: two implementations of one interface change together when it grows. */
  const HELD_BY_THE_COMPILER = [
    // Both are a Program; they gained each thing a Program can do together, and the type says what a Program is.
    "features/technical-debt/technicalDebtProgram.ts ~ platform/program/aProgram.ts",
  ];

  it("are held by a test that imports both sides, wherever two files of different boxes changed together twice with nothing joining them", () => {
    const unheld = unheldCouplingsOf(history, graph, 2)
      .map(({ a, b }) => `${a} ~ ${b}`)
      .filter((pair) => !HELD_BY_THE_COMPILER.includes(pair));
    expect(unheld, "write a test that imports both, and says what they agree on").toEqual([]);
  });
});
