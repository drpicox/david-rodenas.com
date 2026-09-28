/** Where the site's source lives, in public. */
const REPOSITORY = "https://github.com/drpicox/david-rodenas.com";

/**
 * A file, or a box, on GitHub as it stood at a commit — so that what the
 * picture shows, at any point of its history, can be read in full. Paths are
 * the source's own, under `src/`; a box is a folder, unless it is one file.
 */
export function sourceUrlOf(sha: string, path: string, kind: "file" | "box" = "file"): string {
  const folder = kind === "box" && !/\.[a-z]+$/.test(path);
  return `${REPOSITORY}/${folder ? "tree" : "blob"}/${sha}/src/${path}`;
}
