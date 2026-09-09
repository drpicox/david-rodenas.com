/**
 * Whether a reader at `current` is inside the navigation entry `route`. The
 * root is the one entry every route is under, so it counts only at home.
 */
export function isHere(current: string, route: string): boolean {
  return route === "/" ? current === "/" : current.startsWith(route);
}
