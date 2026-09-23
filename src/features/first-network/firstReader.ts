import { LetterReader } from "./LetterReader";

/** The lesson the page opens on, the same at build time and in the browser: A against B, two hundred rounds. */
export function firstReader(letters: readonly string[] = ["A", "B"]): LetterReader {
  const reader = new LetterReader(letters, 1);
  reader.train(200);
  return reader;
}
