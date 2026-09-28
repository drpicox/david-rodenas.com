import { decodeHistory } from "./decodeHistory";
import type { History } from "./History";
import type { Life } from "./Life";
import { livesOf } from "./livesOf";
import type { Snapshot } from "./Snapshot";

/** The history, and what every question about it starts from: the source at each commit, and the life of each file. */
export interface HistoryRead {
  readonly history: History;
  readonly snapshots: readonly Snapshot[];
  readonly lives: readonly Life[];
}

let last: { text: string; read: HistoryRead } | undefined;

/** The history the tool wrote, read once however many figures of one page ask for it: each of them is handed the same text. */
export function readHistory(text: string): HistoryRead {
  if (last?.text === text) return last.read;
  const history = JSON.parse(text) as History;
  const read = { history, snapshots: decodeHistory(history), lives: livesOf(history) };
  last = { text, read };
  return read;
}
