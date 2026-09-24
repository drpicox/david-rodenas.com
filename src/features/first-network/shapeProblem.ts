/** Short enough to sit in a checkbox's label and a bar's row. */
const LONGEST = 3;

/**
 * Why a drawing cannot be remembered under a name, in the words the page
 * shows, or null when it can. `taken` is every name already taught or kept.
 */
export function shapeProblem(name: string, pixels: readonly number[], taken: readonly string[]): string | null {
  const trimmed = name.trim();
  if (trimmed === "") return "Give it a name first.";
  if ([...trimmed].length > LONGEST) return "A name of three characters at most.";
  if (taken.includes(trimmed)) return `“${trimmed}” is already a letter it knows.`;
  if (!pixels.some(Boolean)) return "There is no ink on the grid to remember.";
  return null;
}
