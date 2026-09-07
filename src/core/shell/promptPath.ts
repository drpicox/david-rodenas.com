/** A route as a shell would show it: `~`, `~/book`. */
export function promptPath(route: string): string {
  return route === "/" ? "~" : `~${route.replace(/\/$/, "")}`;
}
