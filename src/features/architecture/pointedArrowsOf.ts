/** An arrow pointing at a file brings out: which way it goes from the file, and how many arrows out it is. */
export interface PointedArrow {
  readonly from: number;
  readonly to: number;
  readonly kind: "needs" | "neededBy";
  readonly distance: number;
}

/**
 * The arrows pointing at a file brings out: from it to what it needs and on,
 * and from what needs it and on, each one step further out than the one
 * before it, and only along the way the reach was found — an arrow between two
 * files it reaches by other ways is not one of its own. `needs` and `neededBy`
 * are the files found each way, at their distance.
 */
export function pointedArrowsOf(links: readonly (readonly [number, number])[], focus: number, needs: ReadonlyMap<number, number>, neededBy: ReadonlyMap<number, number>): PointedArrow[] {
  const distanceOf = (found: ReadonlyMap<number, number>, id: number) => (id === focus ? 0 : found.get(id));
  return links.flatMap(([from, to]): PointedArrow[] => {
    const [out, into] = [distanceOf(needs, from), distanceOf(neededBy, to)];
    return [
      ...(out !== undefined && needs.get(to) === out + 1 ? [{ from, to, kind: "needs" as const, distance: out + 1 }] : []),
      ...(into !== undefined && neededBy.get(from) === into + 1 ? [{ from, to, kind: "neededBy" as const, distance: into + 1 }] : []),
    ];
  });
}
