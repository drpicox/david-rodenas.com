import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";

/**
 * Reads the source at every commit that changed it and writes the history the
 * architecture page plays: `public/data/architecture.json`.
 *
 *   npm run coverage && node tools/architecture-history.mjs
 *   node tools/architecture-history.mjs --out <file> [--with-working-tree]
 *
 * With --out, the history alone goes to that file and public/data is left as
 * it is: for a check that wants the history as it now is without touching
 * what is committed. With --with-working-tree, what is not committed yet comes
 * after the last commit, as one more: the files as they are, the moves git
 * sees against the last commit. A check before a commit then reads the
 * history as the deploy will, once the commit is made.
 *
 * With the coverage counted first, it also writes `public/data/coverage.json`:
 * how many of each file's lines the tests run, at the last commit.
 *
 * It runs before the build and not inside it, because the history is every
 * commit and a build needs only one: the deploy checks out all of them and runs
 * it on every push, so the page is always the commit being published. Here it
 * is for seeing the page as it will be. The graph is read with the same code the
 * architecture test uses, loaded through vite so this tool needs nothing else.
 *
 * The history is the main line's, each commit against the one before it on
 * that line: a branch's commits arrive with the merge that brought them. Taken
 * in the order of their dates instead, a branch's commits and the main line's
 * took turns, and each looked as if it had deleted the files of the other.
 */
const asked = process.argv.indexOf("--out");
const OUT = asked >= 0 ? process.argv[asked + 1] : "public/data/architecture.json";
const WORKING = process.argv.includes("--with-working-tree");
/** What the ratchet holds, read at every commit too, so the page can show how it went. */
const RATCHET = "src/architecture.ratchet.json";
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

/**
 * For each commit, what git saw it do under `src/`, against the commit before
 * it on the main line: the files it renamed, as `[before, after]`, and every
 * file it edited or moved, by its path after it — both relative to `src/`.
 */
function touchesByCommit() {
  const touches = new Map();
  let current = null;
  for (const line of git("log", "--first-parent", "--diff-merges=first-parent", "-M", "--name-status", "--format=@%H", "--", "src").split("\n")) {
    if (line.startsWith("@")) {
      current = { renamed: [], touched: [] };
      touches.set(line.slice(1), current);
      continue;
    }
    const [status = "", ...paths] = line.split("\t");
    const [from, to = from] = paths;
    if (!current || !to?.startsWith("src/")) continue;
    if (status.startsWith("R") && from.startsWith("src/")) current.renamed.push([from.slice(4), to.slice(4)]);
    if (/^[MRT]/.test(status)) current.touched.push(to.slice(4));
  }
  return touches;
}

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "warn" });
try {
  const { readGraph } = await vite.ssrLoadModule("/src/features/architecture/readGraph.ts");
  const { encodeHistory } = await vite.ssrLoadModule("/src/features/architecture/encodeHistory.ts");

  const commits = git("log", "--reverse", "--first-parent", "--format=%H%x09%ad%x09%s", "--date=iso-strict", "--", "src")
    .trim()
    .split("\n")
    .map((line) => {
      const [sha, date, subject] = line.split("\t");
      return { sha, date, subject };
    });
  const touches = touchesByCommit();

  const listed = commits.map(({ sha }) =>
    git("ls-tree", "-r", sha, "--", "src")
      .trim()
      .split("\n")
      .map((line) => {
        const [meta, path] = line.split("\t");
        return { blob: meta.split(" ")[2], path };
      }),
  );
  const trees = listed.map((tree) => tree.filter(({ path }) => path.endsWith(".ts") && !path.endsWith(".d.ts")));
  const ratchets = listed.map((tree) => tree.find(({ path }) => path === RATCHET)?.blob);
  const texts = await readBlobs([...new Set([...trees.flatMap((tree) => tree.map(({ blob }) => blob)), ...ratchets.filter(Boolean)])]);
  // A ratchet that cannot be read at some commit is as if there were none there.
  const ratchetAt = (index) => {
    try {
      return ratchets[index] ? JSON.parse(texts.get(ratchets[index]) ?? "") : undefined;
    } catch {
      return undefined;
    }
  };

  const played = commits.map((commit, index) => ({
    commit: { sha: commit.sha.slice(0, 7), date: commit.date, subject: commit.subject },
    graph: readGraph(trees[index].map(({ blob, path }) => ({ path: path.slice(4), text: texts.get(blob) ?? "" }))),
    renamed: touches.get(commit.sha)?.renamed ?? [],
    touched: touches.get(commit.sha)?.touched ?? [],
    ratchet: ratchetAt(index),
  }));

  if (WORKING) {
    const renamed = [];
    const touched = [];
    for (const line of git("diff", "HEAD", "-M", "--name-status", "--", "src").split("\n")) {
      const [status = "", from, to = from] = line.split("\t");
      if (!to?.startsWith("src/")) continue;
      if (status.startsWith("R") && from.startsWith("src/")) renamed.push([from.slice(4), to.slice(4)]);
      if (/^[MRT]/.test(status)) touched.push(to.slice(4));
    }
    const files = git("ls-files", "--cached", "--others", "--exclude-standard", "--", "src")
      .split("\n")
      .filter((path) => path.endsWith(".ts") && !path.endsWith(".d.ts") && existsSync(path));
    let ratchet;
    try {
      ratchet = JSON.parse(readFileSync(RATCHET, "utf8"));
    } catch {}
    played.push({
      commit: { sha: "working", date: new Date().toISOString(), subject: "not committed yet" },
      graph: readGraph(files.map((path) => ({ path: path.slice(4), text: readFileSync(path, "utf8") }))),
      renamed,
      touched,
      ...(ratchet ? { ratchet } : {}),
    });
  }

  const history = encodeHistory(played);
  writeFileSync(OUT, `${JSON.stringify(history)}\n`);

  // The lines the tests run, if `npm run coverage` has counted them: only for the last commit, which is the one they ran on.
  const { coverageOf } = await vite.ssrLoadModule("/src/features/architecture/coverageOf.ts");
  if (asked >= 0) console.log("the history only, written where asked");
  else if (existsSync(SUMMARY)) {
    const coverage = coverageOf(JSON.parse(readFileSync(SUMMARY, "utf8")), resolve("src"), played.at(-1).commit.sha);
    writeFileSync(COVERAGE, `${JSON.stringify(coverage)}\n`);
    console.log(`${COVERAGE}: ${Object.keys(coverage.lines).length} files`);
  } else console.log(`no ${SUMMARY}: run npm run coverage first to put the lines the tests run on the page`);
  const last = played.at(-1).graph;
  console.log(`${OUT}: ${commits.length} commits, ${last.modules.length} modules and ${last.dependencies.length} arrows at the end, ${(JSON.stringify(history).length / 1024).toFixed(0)} KB`);
} finally {
  await vite.close();
}
