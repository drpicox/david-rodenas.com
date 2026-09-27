import type { History } from "./History";
import type { Snapshot } from "./Snapshot";

type Module = Snapshot["modules"][number];

/** Every snapshot back whole, one for each commit, each built on the one before. */
export function decodeHistory(history: History): Snapshot[] {
  const modules = new Map<number, Module>();
  const arrows = new Map<string, boolean>();
  return history.changes.map((change) => {
    for (const id of change.removed) modules.delete(id);
    for (const [id, path, lines, test] of change.added) modules.set(id, { id, path, lines, test });
    for (const [id, path] of change.moved) {
      const module = modules.get(id);
      if (module) modules.set(id, { ...module, path });
    }
    for (const [id, lines] of change.resized) {
      const module = modules.get(id);
      if (module) modules.set(id, { ...module, lines });
    }
    for (const [from, to] of change.unlinked) arrows.delete(`${from}>${to}`);
    for (const [from, to, typeOnly] of change.linked) arrows.set(`${from}>${to}`, typeOnly);
    return {
      modules: [...modules.values()].sort((a, b) => a.id - b.id),
      dependencies: [...arrows]
        .map(([key, typeOnly]) => {
          const [from = 0, to = 0] = key.split(">").map(Number);
          return { from, to, typeOnly };
        })
        .sort((a, b) => a.from - b.from || a.to - b.to),
    };
  });
}
