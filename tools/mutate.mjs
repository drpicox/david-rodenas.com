import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "vite";

/**
 * Breaks, on purpose, the lines a push changed, one small change at a time —
 * `===` into `!==`, `&&` into `||`, `true` into `false` — and runs the tests
 * that import each file, to see whether one fails. A line no test notices
 * breaking is a line no test checks, however much of it the tests run: code
 * coverage says a line was run, and this says whether running it was checked.
 * It prints, in markdown, what no test caught, for the summary of the deploy's
 * run; it is there to be read, not to pass.
 *
 *   node tools/mutate.mjs [sha before]
 *
 * From the commit given; without one, what is not committed yet, new files
 * whole, or else the last commit. Every file is put back as it was after each
 * change, and on the way out whatever happens.
 *
 * A change can make the tests loop for ever — `>=` into `<` in the condition
 * of a loop, a step by one the other way — and a run that never ends would
 * hold the deploy until the runner gave up on it, hours later, as it did once.
 * So each run has as long as a whole run of the tests could take, and one
 * that takes longer is stopped, its workers with it, and counted as caught:
 * the tests did not pass.
 */
const MOST = 30;
const HANG = 180_000;
const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 26 });

/** What the push changed, as git's hunks say it: for each file, the lines it gained or changed. */
function changedLines(range) {
  const changed = new Map();
  let file = null;
  for (const line of git("diff", "-U0", range, "--", "src").split("\n")) {
    if (line.startsWith("+++ ")) {
      file = line.startsWith("+++ b/") ? line.slice(6) : null;
      continue;
    }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (!hunk || !file) continue;
    const [start, count] = [Number(hunk[1]), hunk[2] === undefined ? 1 : Number(hunk[2])];
    const lines = changed.get(file) ?? new Set();
    for (let at = start; at < start + count; at += 1) lines.add(at);
    changed.set(file, lines);
  }
  return changed;
}

function rangeFrom(before) {
  // A push to a new branch starts from nothing: the commit before the last will do.
  if (before && !/^0+$/.test(before)) {
    try {
      git("cat-file", "-e", `${before}^{commit}`);
      return `${before}..HEAD`;
    } catch {}
    return "HEAD~1..HEAD";
  }
  return git("status", "--porcelain", "--", "src").trim() ? "HEAD" : "HEAD~1..HEAD";
}

/** Files not committed yet, which git diff does not see: every line of them is new. */
function untracked() {
  return git("ls-files", "--others", "--exclude-standard", "--", "src")
    .split("\n")
    .filter(Boolean)
    .map((file) => [file, new Set(readFileSync(file, "utf8").split("\n").map((_, index) => index + 1))]);
}

/** The tests that import a file, run once, in a group of processes of their own, so that a run that hangs can be stopped whole. */
function relatedRun(file) {
  return new Promise((resolve) => {
    const child = spawn("npx", ["vitest", "related", file, "--run", "--passWithNoTests", "--silent"], { detached: true, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    let settled = false;
    const settle = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    const timer = setTimeout(() => {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {}
      settle({ status: null, output, hung: true });
    }, HANG);
    child.on("close", (status) => settle({ status, output, hung: false }));
  });
}

let restore = null;
process.on("exit", () => restore?.());
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "warn" });
try {
  const { mutantsOf } = await vite.ssrLoadModule("/src/features/architecture/mutantsOf.ts");
  const range = rangeFrom(process.argv[2] ?? "");
  const files = [...changedLines(range), ...(range === "HEAD" ? untracked() : [])].filter(([file]) => file.endsWith(".ts") && !/\.(test|d)\.ts$/.test(file) && existsSync(file));
  const each = Math.max(1, Math.floor(MOST / Math.max(1, files.length)));
  const tried = [];
  for (const [file, lines] of files) {
    const original = readFileSync(file, "utf8");
    for (const mutant of mutantsOf(original, lines, each)) {
      restore = () => writeFileSync(file, original);
      writeFileSync(file, mutant.text);
      const run = await relatedRun(file);
      restore();
      restore = null;
      const none = /No test files found/.test(run.output);
      tried.push({ file, line: mutant.line, from: mutant.from, to: mutant.to, caught: (run.hung || run.status !== 0) && !none, none, hung: run.hung });
    }
  }
  const missed = tried.filter(({ caught }) => !caught);
  const code = (text) => `\`${text.replaceAll("|", "\\|")}\``;
  const lines = [`### Broken on purpose: the lines ${range === "HEAD" ? "not committed yet" : range} changed`, ""];
  if (tried.length === 0) lines.push("Nothing on those lines to break.");
  else {
    const hung = tried.filter((one) => one.hung).length;
    const stopped = hung > 0 ? ` (${hung} by making the tests run on past ${HANG / 60_000} minutes, and were stopped)` : "";
    lines.push(`${tried.length - missed.length} of ${tried.length} small changes to those lines made a test fail${stopped}.${missed.length > 0 ? " These did not:" : ""}`);
    // The same change on the same line, more than once, is one row, counted.
    const rows = new Map();
    for (const { file, line, from, to, none } of missed) {
      const key = `| ${code(file)} | ${line} | ${code(from)} → ${code(to)} | ${none ? "no test imports it" : "no test failed"}`;
      rows.set(key, (rows.get(key) ?? 0) + 1);
    }
    if (missed.length > 0) lines.push("", "| file | line | change | |", "| --- | ---: | --- | --- |", ...[...rows].map(([row, times]) => `${row}${times > 1 ? `, ${times} times` : ""} |`));
  }
  process.stdout.write(`${lines.join("\n")}\n`);
} finally {
  restore?.();
  await vite.close();
}
