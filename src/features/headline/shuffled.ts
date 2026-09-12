/** The items in an order drawn by lot, every order as likely as any other, from a source of numbers in [0, 1). */
export function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const drawn = [...items];
  for (let at = drawn.length - 1; at > 0; at -= 1) {
    const swap = Math.min(at, Math.floor(random() * (at + 1)));
    [drawn[at], drawn[swap]] = [drawn[swap] as T, drawn[at] as T];
  }
  return drawn;
}
