/**
 * Whether a page is at, or inside, a directory. The root is inside nothing
 * and holds everything, so it is "here" only when it is the page itself;
 * otherwise every name in the navigation would be lit at once.
 */
export function isHere(route: string, directory: string): boolean {
  if (directory === "/") return route === "/";
  return route.startsWith(directory);
}
