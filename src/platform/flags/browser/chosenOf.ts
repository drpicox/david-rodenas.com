/**
 * The choice a flag with choices is at on this page — `search=palette` on
 * the root's `data-flags` is palette — or none while it is off. Read off the
 * root each time it is wanted, as a stylesheet reads it, because a reader can
 * switch it at the prompt while the page is open.
 */
export function chosenOf(name: string, root: HTMLElement = document.documentElement): string | null {
  const token = (root.dataset["flags"] ?? "").split(" ").find((each) => each.startsWith(`${name}=`));
  return token === undefined ? null : token.slice(name.length + 1);
}
