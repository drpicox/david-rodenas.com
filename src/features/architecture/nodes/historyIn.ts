import { readHistory, type HistoryRead } from "../readHistory";

/** The history the site serves, read once however many nodes ask for it. */
export function historyIn(read: (path: string) => string): HistoryRead {
  return readHistory(read("/data/architecture.json"));
}
