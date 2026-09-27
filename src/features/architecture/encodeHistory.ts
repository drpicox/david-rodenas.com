import type { Change, Commit, History } from "./History";
import type { SourceGraph } from "./SourceGraph";

export interface Played {
  readonly commit: Commit;
  readonly graph: SourceGraph;
  /** `[before, after]` for each file git saw renamed in this commit. */
  readonly renamed: readonly (readonly [string, string])[];
}

interface Kept {
  readonly path: string;
  readonly lines: number;
}

/**
 * The source, commit by commit, as what changed from one to the next. A file
 * keeps its number through every rename git saw, which is what lets the
 * picture show a refactor as a ball crossing from one box into another.
 */
export function encodeHistory(played: readonly Played[]): History {
  const idOf = new Map<string, number>();
  let next = 0;
  let before = new Map<number, Kept>();
  let arrowsBefore = new Map<string, boolean>();
  const changes: Change[] = [];

  for (const { graph, renamed } of played) {
    for (const [from, to] of renamed) {
      const id = idOf.get(from);
      if (id === undefined) continue;
      idOf.delete(from);
      idOf.set(to, id);
    }

    const now = new Map<number, Kept>();
    const added: [number, string, number, boolean, boolean?][] = [];
    for (const module of graph.modules) {
      let id = idOf.get(module.path);
      if (id === undefined) {
        id = next;
        next += 1;
        idOf.set(module.path, id);
      }
      now.set(id, { path: module.path, lines: module.lines });
      if (!before.has(id)) added.push(module.typesOnly ? [id, module.path, module.lines, module.test, true] : [id, module.path, module.lines, module.test]);
    }
    for (const [path, id] of idOf) if (!now.has(id) || now.get(id)?.path !== path) idOf.delete(path);

    const removed = [...before.keys()].filter((id) => !now.has(id)).sort((a, b) => a - b);
    const moved: [number, string][] = [];
    const resized: [number, number][] = [];
    for (const [id, kept] of now) {
      const was = before.get(id);
      if (!was) continue;
      if (was.path !== kept.path) moved.push([id, kept.path]);
      if (was.lines !== kept.lines) resized.push([id, kept.lines]);
    }

    const arrows = new Map<string, boolean>();
    const linked: [number, number, boolean][] = [];
    for (const { from, to, typeOnly } of graph.dependencies) {
      const [a, b] = [idOf.get(from), idOf.get(to)];
      if (a === undefined || b === undefined) continue;
      const key = `${a}>${b}`;
      arrows.set(key, typeOnly);
      if (arrowsBefore.get(key) !== typeOnly) linked.push([a, b, typeOnly]);
    }
    const unlinked = [...arrowsBefore.keys()].filter((key) => !arrows.has(key)).map((key) => key.split(">").map(Number) as [number, number]);

    changes.push({ added, removed, moved, resized, linked, unlinked });
    before = now;
    arrowsBefore = arrows;
  }

  return { commits: played.map(({ commit }) => commit), changes };
}
