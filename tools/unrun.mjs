import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";

/**
 * What no test runs, and what each file of it asks — whether it is hard to
 * test, whether it has a purpose at all, or whether it has one no test states
 * — as markdown, from what `npm run coverage` counted. The deploy writes it
 * into the summary of its run; it is there to be read, not to pass.
 *
 *   npm run coverage && node tools/unrun.mjs
 */
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "warn" });
try {
  const load = (name) => vite.ssrLoadModule(`/src/features/architecture/${name}.ts`);
  const [{ readGraph }, { readSources }, { unrunOf }, { renderUnrunReport }] = await Promise.all(["readGraph", "readSources", "unrunOf", "renderUnrunReport"].map(load));
  const coverage = JSON.parse(readFileSync("coverage/coverage-final.json", "utf8"));
  // What the tools, the hooks and the build load by path is used, though no import in the source says so.
  const scripts = [
    ...readdirSync("tools").filter((name) => name.endsWith(".mjs")).map((name) => `tools/${name}`),
    ...readdirSync(".claude/hooks").filter((name) => name.endsWith(".mjs")).map((name) => `.claude/hooks/${name}`),
    "vite.config.ts",
  ];
  const loaded = new Set(scripts.flatMap((file) => [...readFileSync(file, "utf8").matchAll(/["'`]\.?\/src\/([^"'`]+?)(?:\.ts)?["'`]/g)].map((found) => `${found[1]}.ts`)));
  process.stdout.write(renderUnrunReport(unrunOf(coverage, readGraph(readSources(resolve("src"))), loaded)));
} finally {
  await vite.close();
}
