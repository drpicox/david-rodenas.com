import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

/**
 * The history the checks read, as the deploy will write it once what is not
 * committed yet is: every commit, and then the working tree as one more,
 * written into .git and never into what is committed. A history from before a
 * file moved does not know its new path, and cannot see what it changes with.
 */
function historyOf(root, git) {
  const fresh = `${root}/${git("rev-parse", "--git-path", "claude-history.json").trim()}`;
  rmSync(fresh, { force: true });
  spawnSync("node", ["tools/architecture-history.mjs", "--out", fresh, "--with-working-tree"], { cwd: root, encoding: "utf8" });
  return existsSync(fresh) ? fresh : null;
}

/**
 * Whether the source, as it stands in the working tree, passes the type check
 * and the tests, the history's checks read against the history as it now is:
 * nothing when it does, and what is red when it does not. A state of the files
 * once found green is remembered inside .git, so asking again of the same
 * state costs nothing — the hook before a commit and the one before the end of
 * a turn ask the same question, often of the same files.
 */
export function redOf(root) {
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 });
  const untracked = git("ls-files", "--others", "--exclude-standard").split("\n").filter(Boolean);
  const state = createHash("sha1")
    .update(git("rev-parse", "HEAD"))
    .update(git("diff", "HEAD"))
    .update(untracked.map((file) => `${file}\0${existsSync(`${root}/${file}`) ? readFileSync(`${root}/${file}`, "utf8") : ""}`).join("\0"))
    .digest("hex");
  const green = `${root}/${git("rev-parse", "--git-path", "claude-green").trim()}`;
  if (existsSync(green) && readFileSync(green, "utf8") === state) return { state, red: null };
  const plain = (text) => text.replace(/\x1b\[[0-9;]*m/g, "");
  const typecheck = spawnSync("npx", ["tsc", "-b", "--noEmit"], { cwd: root, encoding: "utf8" });
  const history = historyOf(root, git);
  const tests = spawnSync("npx", ["vitest", "run", "--silent"], { cwd: root, encoding: "utf8", env: { ...process.env, ...(history ? { ARCHITECTURE_HISTORY: history } : {}) } });
  if (typecheck.status === 0 && tests.status === 0) {
    writeFileSync(green, state);
    return { state, red: null };
  }
  rmSync(green, { force: true });
  const red = [
    typecheck.status !== 0 ? `The type check is red:\n${plain(typecheck.stdout).split("\n").slice(0, 8).join("\n")}` : "",
    tests.status !== 0 ? `The tests are red:\n${plain(`${tests.stdout}${tests.stderr}`).split("\n").filter((line) => /×|FAIL|held, /.test(line)).slice(0, 12).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  return { state, red };
}
