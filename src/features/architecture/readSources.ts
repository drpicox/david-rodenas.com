import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import type { Source } from "./readGraph";

/** Every TypeScript file under a folder, tests among them, as the graph reads them. Node only: it is the build's and the tests' eyes, never the browser's. */
export function readSources(root: string): Source[] {
  const walk = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return walk(path);
      return entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts") ? [path] : [];
    });
  return walk(root)
    .sort()
    .map((path) => ({ path: relative(root, path), text: readFileSync(path, "utf8") }));
}
