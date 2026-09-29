import { fileHistoryOf } from "./fileHistoryOf";
import { plural } from "./plural";
import { positionOf } from "./positionOf";
import type { HistoryRead } from "./readHistory";

const nameOf = (path: string) => path.split("/").pop() ?? path;
/** Files a note names it changes with: the ones it changed with most. */
const PARTNERS = 4;

/**
 * What an agent is told of a file it has just edited, from the history as far
 * as it goes: how often the file has changed; what it usually changes with,
 * and, of each one no arrow joins it to, whether a test imports both and so
 * holds what the two agree on; what needs it and how far a change to it could
 * reach; and the tests that import it. It is the panel beside the picture,
 * said at the moment it matters. Nothing, of a file the history does not know
 * yet.
 */
export function editNoteOf(read: HistoryRead, path: string): string | null {
  const at = read.snapshots.length - 1;
  const [snapshot, commit] = [read.snapshots[at], read.history.commits[at]];
  const module = snapshot?.modules.find((one) => one.path === path);
  if (!snapshot || !commit || !module) return null;
  const history = fileHistoryOf(read, at, module.id);
  const position = positionOf(snapshot, module.id);
  const tests = snapshot.modules
    .filter((one) => one.test)
    .map((test) => ({ path: test.path, imports: new Set(snapshot.dependencies.filter(({ from }) => from === test.id).map(({ to }) => to)) }));
  const holding = (other: number) => tests.find(({ imports }) => imports.has(module.id) && imports.has(other))?.path;
  const partners = history.partners.slice(0, PARTNERS).map(({ id, path: other, together, joined }) => {
    if (joined !== "none") return `${nameOf(other)} ${together}×`;
    const test = holding(id);
    return `${nameOf(other)} ${together}× (no arrow joins them, ${test ? `held by ${nameOf(test)}` : "and no test imports both"})`;
  });
  const importing = tests.filter(({ imports }) => imports.has(module.id)).map((test) => nameOf(test.path));
  return [
    `${path} changed ${plural(history.changes.length, "time")} since it was written, in the history to ${commit.sha}.`,
    partners.length > 0 ? `It usually changes with ${partners.join(", ")}.` : "No file has changed with it twice.",
    `It is needed by ${plural(position.neededBy, "file")} directly; a change to it could reach ${position.reaches}.`,
    importing.length > 0 ? `The tests that import it: ${importing.join(", ")}.` : "No test imports it.",
  ].join(" ");
}
