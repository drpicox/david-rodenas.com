import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { createServer } from "vite";

/**
 * A Claude Code hook, after Write, Edit or MultiEdit. When the file is one of
 * the source, the agent is told what the history knows of it: how often it has
 * changed, what it usually changes with — and, where no arrow joins the two,
 * whether a test holds what they agree on — what needs it, and the tests that
 * import it. The panel beside the picture, said at the moment it matters.
 */
const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const file = input.tool_input?.file_path ?? "";
const path = relative(`${root}/src`, file);
if (!file || path.startsWith("..") || !path.endsWith(".ts") || /\.(test|d)\.ts$/.test(path)) process.exit(0);
process.chdir(root);
const vite = await createServer({ root, server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  const { readHistory } = await vite.ssrLoadModule("/src/features/architecture/readHistory.ts");
  const { editNoteOf } = await vite.ssrLoadModule("/src/features/architecture/editNoteOf.ts");
  const note = editNoteOf(readHistory(readFileSync("public/data/architecture.json", "utf8")), path);
  if (note) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: note } }));
} catch {
  // A note that cannot be written is no reason to trouble an edit.
} finally {
  await vite.close();
}
