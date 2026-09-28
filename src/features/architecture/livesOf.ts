import type { History } from "./History";
import type { Life } from "./Life";

type Growing = { -readonly [Key in keyof Life]: Life[Key] } & { changed: number[] };

/**
 * Every file the history ever held, from the commit that brought it to the
 * one it went in, with every commit that changed it between — the record
 * the questions about change are asked of: how often, how early, with what.
 */
export function livesOf(history: History): Life[] {
  const lives = new Map<number, Growing>();
  const update = (id: number, fields: Partial<Growing>) => {
    const life = lives.get(id);
    if (life) Object.assign(life, fields);
  };
  history.changes.forEach((change, at) => {
    for (const [id, path, lines, test, typesOnly = false] of change.added) lives.set(id, { id, path, lines, test, typesOnly, born: at, changed: [] });
    for (const [id, path] of change.moved) update(id, { path });
    for (const [id, lines] of change.resized) update(id, { lines });
    for (const [id, typesOnly] of change.retyped) update(id, { typesOnly });
    for (const id of change.changed) lives.get(id)?.changed.push(at);
    for (const id of change.removed) update(id, { went: at });
  });
  return [...lives.values()].sort((a, b) => a.id - b.id);
}
