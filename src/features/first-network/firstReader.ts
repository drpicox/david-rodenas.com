import { glyphs } from "./glyphs";
import { LetterReader } from "./LetterReader";
import type { Shape } from "./Shape";

const A_AND_B: readonly Shape[] = [
  { name: "A", pixels: glyphs.A! },
  { name: "B", pixels: glyphs.B! },
];

/** The lesson the page opens on, the same at build time and in the browser: A against B, two hundred rounds. */
export function firstReader(shapes: readonly Shape[] = A_AND_B): LetterReader {
  const reader = new LetterReader(shapes, 1);
  reader.train(200);
  return reader;
}
