import type { Coverage } from "./Coverage";

type Summary = Readonly<Record<string, { readonly lines: { readonly pct: number } }>>;

/** The summary `npm run coverage` writes, by absolute path, as the share of each file's lines the tests run, by its path under the source root. */
export function coverageOf(summary: Summary, root: string, sha: string): Coverage {
  const prefix = root.endsWith("/") ? root : `${root}/`;
  const lines: Record<string, number> = {};
  for (const [path, { lines: counted }] of Object.entries(summary)) if (path.startsWith(prefix)) lines[path.slice(prefix.length)] = counted.pct;
  return { sha, lines };
}
