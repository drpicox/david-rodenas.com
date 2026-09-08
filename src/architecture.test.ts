import { readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = new URL(".", import.meta.url).pathname.replace(/\/$/, "");
const ROOT = dirname(SRC);

function filesIn(directory: string, keep: (name: string) => boolean): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesIn(path, keep);
    return keep(entry.name) ? [path] : [];
  });
}

const sources = filesIn(SRC, (name) => name.endsWith(".ts") && !name.endsWith(".d.ts"));
const here = (path: string) => relative(ROOT, path);

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

/** What a file imports, as the paths of the files it names. */
function importsOf(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const specifiers = [...text.matchAll(/from\s+"(\.[^"]*)"/g)].map((match) => match[1] ?? "");
  return specifiers.flatMap((specifier) => {
    const target = resolve(dirname(file), specifier);
    return [`${target}.ts`, target].filter((candidate) => sources.includes(candidate)).slice(0, 1);
  });
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
  const EXEMPT = [join(SRC, "main.ts"), join(SRC, "architecture.test.ts")];
  const GLOBALS = /\b(document|window|localStorage|sessionStorage|navigator)\b/;

  it("keeps the DOM inside folders named browser/", () => {
    const trespassing = sources
      .filter((file) => !BROWSER.test(file) && !EXEMPT.includes(file))
      .filter((file) => GLOBALS.test(code(readFileSync(file, "utf8"))));
    expect(trespassing.map(here)).toEqual([]);
  });

  it("never lets the frame import a feature", () => {
    const wrongWay = sources
      .filter((file) => file.startsWith(join(SRC, "platform")))
      .filter((file) => importsOf(file).some((target) => target.startsWith(join(SRC, "features"))));
    expect(wrongWay.map(here)).toEqual([]);
  });

  // This is the one that would actually crash: the build renders every page in node.
  it("keeps the whole build-time renderer clear of the browser", () => {
    const seen = new Set<string>();
    const queue = [join(SRC, "platform/page/renderDocument.ts")];
    while (queue.length > 0) {
      const file = queue.pop();
      if (!file || seen.has(file)) continue;
      seen.add(file);
      queue.push(...importsOf(file));
    }
    const wouldCrash = [...seen].filter((file) => BROWSER.test(file) || GLOBALS.test(code(readFileSync(file, "utf8"))));
    expect(wouldCrash.map(here)).toEqual([]);
    expect(seen.size).toBeGreaterThan(5);
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
