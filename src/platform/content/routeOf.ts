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
