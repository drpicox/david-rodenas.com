/**
 * `work/orion.md` is the page at `/work/orion/`, and `work/index.md` is the
 * directory itself. What looks like a path is a path: the URL, the file and
 * what `ls` prints are three views of one thing.
 */
export function routeOf(file: string): string {
  const withoutExtension = file.replace(/\.md$/, "");
  const withoutIndex = withoutExtension.replace(/(^|\/)index$/, "");
  return withoutIndex === "" ? "/" : `/${withoutIndex}/`;
}

/** The directory a route is listed in, or null for the root. */
export function parentOf(route: string): string | null {
  if (route === "/") return null;
  const trimmed = route.slice(0, -1);
  return trimmed.slice(0, trimmed.lastIndexOf("/") + 1);
}

/** The last segment, which is the name a listing shows. */
export function nameOf(route: string): string {
  if (route === "/") return "/";
  const trimmed = route.slice(0, -1);
  return trimmed.slice(trimmed.lastIndexOf("/") + 1);
}
