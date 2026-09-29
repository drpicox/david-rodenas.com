import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { redOf } from "./green.mjs";

/**
 * A Claude Code hook, when the agent is about to end its turn. If anything is
 * not committed, the type check and the tests have to be green, or the agent
 * is told to put them right first, with what is red. The same red is never
 * held more than twice, since a red the agent cannot mend is for the person to
 * see.
 */
const input = JSON.parse(readFileSync(0, "utf8") || "{}");
if (input.stop_hook_active) process.exit(0);
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 });
if (!git("status", "--porcelain").trim()) process.exit(0);

const { state, red } = redOf(root);
const held = `${root}/${git("rev-parse", "--git-path", "claude-held").trim()}`;
if (!red) {
  rmSync(held, { force: true });
  process.exit(0);
}
const [heldState, heldTimes] = existsSync(held) ? readFileSync(held, "utf8").split(" ") : ["", "0"];
if (heldState === state && Number(heldTimes) >= 2) process.exit(0);
writeFileSync(held, `${state} ${heldState === state ? Number(heldTimes) + 1 : 1}`);
process.stdout.write(JSON.stringify({ decision: "block", reason: `Not yet: what is not committed leaves the source red. Put it right before stopping.\n\n${red}` }));
