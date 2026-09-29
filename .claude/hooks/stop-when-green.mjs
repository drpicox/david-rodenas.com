import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

/**
 * A Claude Code hook, when the agent is about to end its turn. If anything is
 * not committed, the type check and the tests have to be green, or the agent
 * is told to put them right first, with what is red. A state of the files once
 * found green is remembered, inside .git, and not checked again; and the same
 * red is never held more than twice, since a red the agent cannot mend is for
 * the person to see.
 */
const input = JSON.parse(readFileSync(0, "utf8") || "{}");
if (input.stop_hook_active) process.exit(0);
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
process.chdir(root);
const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 26 });
if (!git("status", "--porcelain").trim()) process.exit(0);

const untracked = git("ls-files", "--others", "--exclude-standard").split("\n").filter(Boolean);
const state = createHash("sha1")
  .update(git("diff", "HEAD"))
  .update(untracked.map((file) => `${file}\0${existsSync(file) ? readFileSync(file, "utf8") : ""}`).join("\0"))
  .digest("hex");
const [green, held] = [git("rev-parse", "--git-path", "claude-green").trim(), git("rev-parse", "--git-path", "claude-held").trim()];
if (existsSync(green) && readFileSync(green, "utf8") === state) process.exit(0);
const [heldState, heldTimes] = existsSync(held) ? readFileSync(held, "utf8").split(" ") : ["", "0"];
if (heldState === state && Number(heldTimes) >= 2) process.exit(0);

const plain = (text) => text.replace(/\x1b\[[0-9;]*m/g, "");
const typecheck = spawnSync("npx", ["tsc", "-b", "--noEmit"], { encoding: "utf8" });
const tests = spawnSync("npx", ["vitest", "run", "--silent"], { encoding: "utf8" });
if (typecheck.status === 0 && tests.status === 0) {
  writeFileSync(green, state);
  rmSync(held, { force: true });
  process.exit(0);
}
writeFileSync(held, `${state} ${heldState === state ? Number(heldTimes) + 1 : 1}`);
const said = [
  typecheck.status !== 0 ? `The type check is red:\n${plain(typecheck.stdout).split("\n").slice(0, 8).join("\n")}` : "",
  tests.status !== 0 ? `The tests are red:\n${plain(`${tests.stdout}${tests.stderr}`).split("\n").filter((line) => /×|FAIL|held, /.test(line)).slice(0, 12).join("\n")}` : "",
]
  .filter(Boolean)
  .join("\n\n");
process.stdout.write(JSON.stringify({ decision: "block", reason: `Not yet: what is not committed leaves the source red. Put it right before stopping.\n\n${said}` }));
