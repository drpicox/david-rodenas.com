/**
 * The route an agent meant, however it wrote it: a path with or without its
 * slashes, the page's whole URL, or the README.md the shell calls it.
 */
export function routeAsked(path: string): string {
  const bare = path
    .trim()
    .replace(/^[a-z]+:\/\/[^/]+/i, "")
    .replace(/[?#].*$/, "")
    .replace(/(?:^|\/)(?:README\.md|index\.html)$/, "");
  const steps = bare.split("/").filter((step) => step !== "" && step !== ".");
  return steps.length === 0 ? "/" : `/${steps.join("/")}/`;
}
