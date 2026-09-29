import type { Snapshot } from "./Snapshot";
import { stronglyConnectedOf } from "./stronglyConnectedOf";

/**
 * How tall the stack under each file that ships is: the arrows of the longest
 * chain of what it needs, and of what that needs, down to a file that needs
 * nothing. Files that need each other round in a circle stand at one height,
 * the circle counted once, or no chain through it would end.
 */
export function heightsOf(snapshot: Snapshot): Map<number, number> {
  const ids = snapshot.modules.filter((module) => !module.test).map((module) => module.id);
  const shipped = new Set(ids);
  const needs = new Map<number, number[]>(ids.map((id) => [id, []]));
  for (const { from, to } of snapshot.dependencies) if (shipped.has(from) && shipped.has(to) && from !== to) needs.get(from)?.push(to);
  // Each circle is one step of a chain; the parts come out after everything they reach, so each is measured after what it stands on.
  const partOf = new Map<number, number>();
  const heights: number[] = [];
  stronglyConnectedOf(ids, (id) => needs.get(id) ?? []).forEach((part, at) => {
    for (const id of part) partOf.set(id, at);
    const below = part.flatMap((id) => (needs.get(id) ?? []).map((to) => partOf.get(to))).filter((other): other is number => other !== undefined && other !== at);
    heights[at] = below.length > 0 ? 1 + Math.max(...below.map((other) => heights[other] ?? 0)) : 0;
  });
  return new Map(ids.map((id) => [id, heights[partOf.get(id) ?? 0] ?? 0]));
}
