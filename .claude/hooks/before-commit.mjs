import { readFileSync } from "node:fs";
import { redOf } from "./green.mjs";

/**
 * A Claude Code hook, before the agent runs a shell command. A command that
 * commits is not let through while the type check or the tests are red: what
 * is committed is what the deploy builds, and a red commit is a failed deploy
 * that the next commit has to mend. Every other command goes by untouched.
 */
const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const command = input.tool_input?.command ?? "";
if (!/\bgit\b[^;&|\n]*\bcommit\b/.test(command)) process.exit(0);
const { red } = redOf(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
if (red)
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: `Not committed: the source is red. Put it right, then commit.\n\n${red}` } }),
  );
