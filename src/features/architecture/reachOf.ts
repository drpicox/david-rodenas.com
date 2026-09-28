/**
 * How far a file reaches: what it needs, following the arrows, or what needs
 * it, going against them — each file found at the shortest distance to it, as
 * far as asked. Distance one is what the file itself names; beyond it is the
 * blast radius, what a change in it could reach, or what could reach it.
 */
export function reachOf(links: readonly (readonly [number, number])[], id: number, depth: number, direction: "needs" | "neededBy"): Map<number, number> {
  const next = new Map<number, number[]>();
  for (const [from, to] of links) {
    const [here, there] = direction === "needs" ? [from, to] : [to, from];
    next.set(here, [...(next.get(here) ?? []), there]);
  }
  const reached = new Map<number, number>();
  let frontier = [id];
  for (let distance = 1; distance <= depth && frontier.length > 0; distance += 1) {
    const found: number[] = [];
    for (const here of frontier)
      for (const there of next.get(here) ?? [])
        if (there !== id && !reached.has(there)) {
          reached.set(there, distance);
          found.push(there);
        }
    frontier = found;
  }
  return reached;
}
