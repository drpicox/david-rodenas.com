import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { foldedOf } from "./foldedOf";
import { wordStarts } from "./wordStarts";

/**
 * A line as markup with every place it says one of the words marked — where
 * a word of the line starts with it, as it is found, the words already folded
 * as a search reads them — and two words that meet with only spaces between
 * them marked as one stretch, as they were typed.
 */
export function markedOf(line: string, words: readonly string[]): string {
  const folded = foldedOf(line);
  const marked = Array.from({ length: line.length }, () => false);
  for (const word of words) for (const at of wordStarts(folded, word)) marked.fill(true, at, at + word.length);
  // A space between two marks is marked with them.
  for (let at = 1; at < line.length; at += 1) {
    if (marked[at] || !/\s/.test(line[at]!) || !marked[at - 1]) continue;
    let end = at;
    while (end < line.length && /\s/.test(line[end]!)) end += 1;
    if (marked[end]) marked.fill(true, at, end);
  }
  let html = "";
  for (let at = 0; at < line.length; ) {
    let end = at;
    while (end < line.length && marked[end] === marked[at]) end += 1;
    const piece = escapeHtml(line.slice(at, end));
    html += marked[at] ? `<mark>${piece}</mark>` : piece;
    at = end;
  }
  return html;
}
