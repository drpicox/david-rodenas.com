import { livesOf } from "./livesOf";
import type { HistoryRead } from "./readHistory";

let last: { read: HistoryRead; at: number; then: HistoryRead } | undefined;

/**
 * The history as it stood at one of its commits: everything up to it and
 * nothing after, each file as it was then — where it stood, and what had
 * changed it so far. Every figure of a page asks for the same commit, so the
 * last answer is kept and given again.
 */
export function historyUpTo(read: HistoryRead, at: number): HistoryRead {
  if (last?.read === read && last.at === at) return last.then;
  const end = Math.max(0, Math.min(at, read.history.commits.length - 1)) + 1;
  const history = { commits: read.history.commits.slice(0, end), changes: read.history.changes.slice(0, end) };
  const then = end === read.history.commits.length ? read : { history, snapshots: read.snapshots.slice(0, end), lives: livesOf(history) };
  last = { read, at, then };
  return then;
}
