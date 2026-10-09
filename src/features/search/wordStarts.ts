/** A letter or a digit: what a word is made of, in any script. */
const WORDLIKE = /[\p{L}\p{N}]/u;

/**
 * Where a word starts a word of a text, both read as a search reads them:
 * every place a word of the text begins with it, and never the middle of one,
 * so that rain finds rainfall but not brain.
 */
export function wordStarts(text: string, word: string): number[] {
  const starts: number[] = [];
  if (!word) return starts;
  for (let at = text.indexOf(word); at >= 0; at = text.indexOf(word, at + 1)) {
    if (at === 0 || !WORDLIKE.test(text[at - 1]!)) starts.push(at);
  }
  return starts;
}
