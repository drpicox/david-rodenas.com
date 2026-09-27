/**
 * The box a file stands in, which is the unit the architecture is about: a
 * folder of the frame (`platform/shell`) or a feature (`features/rocket`).
 * What is deeper — a `browser/`, a `commands/` — is inside its box, and a
 * file standing alone at the top of either — `main.ts`, `allFeatures.ts` —
 * is a box of its own.
 */
export function boxOf(path: string): string {
  const parts = path.split("/");
  return parts.length <= 2 ? path : `${parts[0]}/${parts[1]}`;
}
