/** One of the others, chosen by a number in [0, 1): never the one showing now, so a change is always a change. */
export function nextHeadline(current: string, all: readonly string[], random: number): string {
  const others = all.filter((headline) => headline !== current);
  if (others.length === 0) return current;
  const index = Math.min(others.length - 1, Math.floor(random * others.length));
  return others[index] ?? current;
}
