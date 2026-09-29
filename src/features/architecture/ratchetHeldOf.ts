import type { History } from "./History";

/** What the ratchet held at every commit of the history: nothing before it began, and from each commit that changed it, what it held from then on. */
export function ratchetHeldOf(history: History): (Readonly<Record<string, number>> | null)[] {
  const changedAt = new Map(history.ratchets ?? []);
  let held: Readonly<Record<string, number>> | null = null;
  return history.changes.map((_, at) => {
    held = changedAt.get(at) ?? held;
    return held;
  });
}
