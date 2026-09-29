import { readFileSync } from "node:fs";
import { createServer } from "vite";

/**
 * How the shape of the source moved with a push, as markdown: the deploy
 * writes it into the summary of its run, once the history is written.
 *
 *   node tools/architecture-history.mjs && node tools/shape-report.mjs [sha before]
 *
 * With the commit the push started from, it sets that one beside the last;
 * without it, or when that commit changed nothing under src/ and is not in the
 * history, the last beside the one before it. It is there to be read: the
 * ratchet, in the tests, is what stops a push.
 */
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "warn" });
try {
  const { readHistory } = await vite.ssrLoadModule("/src/features/architecture/readHistory.ts");
  const { renderShapeReport } = await vite.ssrLoadModule("/src/features/architecture/renderShapeReport.ts");
  const read = readHistory(readFileSync("public/data/architecture.json", "utf8"));
  const last = read.history.commits.length - 1;
  const before = process.argv[2] ?? "";
  const found = before ? read.history.commits.findIndex((commit) => before.startsWith(commit.sha)) : -1;
  process.stdout.write(renderShapeReport(read, found >= 0 && found < last ? found : Math.max(0, last - 1), last));
} finally {
  await vite.close();
}
