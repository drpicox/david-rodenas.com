import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createServer } from "vite";

/**
 * Brings the open data the features keep up to the last finished year. It
 * runs before every build and nearly always does nothing: a source that holds
 * every finished year is not asked anything until the year changes.
 *
 * It never fails. The portal being down, slow or wrong is reported and the
 * build goes on with what the repository already holds.
 *
 *   node tools/refresh-data.mjs                 whatever is missing
 *   node tools/refresh-data.mjs --year 2024     that year again, held or not
 *   node tools/refresh-data.mjs --only no2      one source
 *
 * Vite loads the TypeScript so this tool needs no toolchain of its own.
 */
const args = process.argv.slice(2);
const valuesOf = (flag) => args.flatMap((arg, index) => (arg === flag ? [args[index + 1]] : []));
const again = valuesOf("--year").map(Number).filter(Number.isInteger);
const only = valuesOf("--only");

const ports = {
  read(path) {
    try {
      return readFileSync(path, "utf8");
    } catch {
      return null;
    }
  },
  // Written beside and then moved over, so a build interrupted mid-write leaves the old file whole.
  write(path, text) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(`${path}.part`, text);
    renameSync(`${path}.part`, path);
  },
  async fetchJson(url) {
    const headers = process.env.SOCRATA_APP_TOKEN ? { "X-App-Token": process.env.SOCRATA_APP_TOKEN } : {};
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(120_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
  today: new Date(),
  log: (line) => console.log(line),
};

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "warn" });
try {
  const { allFeatures } = await vite.ssrLoadModule("/src/features/allFeatures.ts");
  const { refreshSource } = await vite.ssrLoadModule("/src/platform/data/refreshSource.ts");
  const sources = allFeatures.flatMap((feature) => feature.sources ?? []).filter((source) => only.length === 0 || only.includes(source.name));
  for (const source of sources) await refreshSource(source, ports, again);
} catch (error) {
  console.log(`refresh-data: gave up (${error?.message ?? error}); the build uses what is held`);
} finally {
  await vite.close();
}
