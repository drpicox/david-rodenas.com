/** Words joined by spaces, except that a punctuation mark hangs on the word before it. */
export function sentenceOf(words: readonly string[]): string {
  return words.reduce((text, word) => (text === "" || /^[.,!?;:]$/.test(word) ? text + word : `${text} ${word}`), "");
}
