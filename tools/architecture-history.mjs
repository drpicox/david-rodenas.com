import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";

/**
 * Reads the source at every commit that changed it and writes the history the
 * architecture page plays: `public/data/architecture.json`.
 *
 *   npm run coverage && node tools/architecture-history.mjs
 *
 * With the coverage counted first, it also writes `public/data/coverage.json`:
 * how many of each file's lines the tests run, at the last commit.
 *
 * It runs before the build and not inside it, because the history is every
 * commit and a build needs only one: the deploy checks out all of them and runs
 * it on every push, so the page is always the commit being published. Here it
 * is for seeing the page as it will be. The graph is read with the same code the
 * architecture test uses, loaded through vite so this tool needs nothing else.
 */
const OUT = "public/data/architecture.json";
const COVERAGE = "public/data/coverage.json";
const SUMMARY = "coverage/coverage-summary.json";
const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 28 });

/** Every blob asked for at once, through one `git cat-file --batch`, which is what makes a hundred snapshots quick. */
function readBlobs(shas) {
  return new Promise((resolve, reject) => {
    const cat = spawn("git", ["cat-file", "--batch"]);
    const chunks = [];
    cat.stdout.on("data", (chunk) => chunks.push(chunk));
    cat.on("error", reject);
    cat.on("close", () => {
      const all = Buffer.concat(chunks);
      const texts = new Map();
      let at = 0;
      while (at < all.length) {
        const end = all.indexOf(10, at);
        const [sha, , size] = all.subarray(at, end).toString().split(" ");
        const length = Number(size);
        texts.set(sha, all.subarray(end + 1, end + 1 + length).toString("utf8"));
        at = end + 1 + length + 1;
      }
      resolve(texts);
    });
    cat.stdin.end(`${shas.join("\n")}\n`);
  });
}

/** For each commit, the files git saw renamed in it, as `[before, after]` relative to `src/`. */
function renamesByCommit() {
  const renames = new Map();
  let current = null;
  for (const line of git("log", "-M", "--name-status", "--format=@%H", "--", "src").split("\n")) {
    if (line.startsWith("@")) {
      current = line.slice(1);
      renames.set(current, []);
    } else if (line.startsWith("R") && current) {
      const [, from, to] = line.split("\t");
      if (from?.startsWith("src/") && to?.startsWith("src/")) renames.get(current).push([from.slice(4), to.slice(4)]);
    }
  }
  return renames;
}

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "warn" });
try {
  const { readGraph } = await vite.ssrLoadModule("/src/features/architecture/readGraph.ts");
  const { encodeHistory } = await vite.ssrLoadModule("/src/features/architecture/encodeHistory.ts");

  const commits = git("log", "--reverse", "--format=%H%x09%ad%x09%s", "--date=iso-strict", "--", "src")
    .trim()
    .split("\n")
    .map((line) => {
      const [sha, date, subject] = line.split("\t");
      return { sha, date, subject };
    });
  const renames = renamesByCommit();

  const trees = commits.map(({ sha }) =>
    git("ls-tree", "-r", sha, "--", "src")
      .trim()
      .split("\n")
      .map((line) => {
        const [meta, path] = line.split("\t");
        return { blob: meta.split(" ")[2], path };
      })
      .filter(({ path }) => path.endsWith(".ts") && !path.endsWith(".d.ts")),
  );
  const texts = await readBlobs([...new Set(trees.flatMap((tree) => tree.map(({ blob }) => blob)))]);

  const played = commits.map((commit, index) => ({
    commit: { sha: commit.sha.slice(0, 7), date: commit.date, subject: commit.subject },
    graph: readGraph(trees[index].map(({ blob, path }) => ({ path: path.slice(4), text: texts.get(blob) ?? "" }))),
    renamed: renames.get(commit.sha) ?? [],
  }));

  const history = encodeHistory(played);
  writeFileSync(OUT, `${JSON.stringify(history)}\n`);

  // The lines the tests run, if `npm run coverage` has counted them: only for the last commit, which is the one they ran on.
  const { coverageOf } = await vite.ssrLoadModule("/src/features/architecture/coverageOf.ts");
  if (existsSync(SUMMARY)) {
    const coverage = coverageOf(JSON.parse(readFileSync(SUMMARY, "utf8")), resolve("src"), played.at(-1).commit.sha);
    writeFileSync(COVERAGE, `${JSON.stringify(coverage)}\n`);
    console.log(`${COVERAGE}: ${Object.keys(coverage.lines).length} files`);
  } else console.log(`no ${SUMMARY}: run npm run coverage first to put the lines the tests run on the page`);
  const last = played.at(-1).graph;
  console.log(`${OUT}: ${commits.length} commits, ${last.modules.length} modules and ${last.dependencies.length} arrows at the end, ${(JSON.stringify(history).length / 1024).toFixed(0)} KB`);
} finally {
  await vite.close();
}
