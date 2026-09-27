import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { boxCycles } from "./features/architecture/boxCycles";
import { readGraph } from "./features/architecture/readGraph";
import { readSources } from "./features/architecture/readSources";
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
