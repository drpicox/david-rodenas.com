/** How many letters have to be added, dropped or changed to turn one word into another. */
function distance(from: string, to: string): number {
  let row = Array.from({ length: to.length + 1 }, (_, index) => index);
  for (let i = 1; i <= from.length; i += 1) {
    const next = [i];
    for (let j = 1; j <= to.length; j += 1) {
      const change = (row[j - 1] ?? 0) + (from[i - 1] === to[j - 1] ? 0 : 1);
      next[j] = Math.min(change, (row[j] ?? 0) + 1, (next[j - 1] ?? 0) + 1);
    }
    row = next;
  }
  return row[to.length] ?? 0;
}

/**
 * The model can only continue from a word it has seen, so a word it has not
 * is read as the nearest one it has. A real model avoids the problem by
 * cutting words into pieces; this one just squints.
 */
export function closestWord(word: string, vocabulary: readonly string[]): string | null {
  if (vocabulary.includes(word)) return word;
  let best: string | null = null;
  let bestDistance = Infinity;
  for (const known of vocabulary) {
    const far = distance(word, known);
    if (far < bestDistance) [best, bestDistance] = [known, far];
  }
  return best;
}
