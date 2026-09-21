const WORD = /[\p{L}\p{M}\p{N}']+|[.,!?;:]/gu;

/** Where a link points, and the marks markdown is written with, are not words anyone said. */
const NOT_TEXT = /\]\([^)]*\)|^---[\s\S]*?\n---|[#*_`>\[\]|]|::[a-z-]+/gm;

/**
 * A text cut into what the model counts: lower-case words, and each
 * punctuation mark as a word of its own — so the model learns where sentences
 * end the same way it learns everything else, by what came before.
 */
export function wordsOf(text: string): string[] {
  return text.normalize("NFKC").replace(NOT_TEXT, " ").toLowerCase().match(WORD) ?? [];
}
