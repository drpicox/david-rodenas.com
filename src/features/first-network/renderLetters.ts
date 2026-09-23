import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { LetterReader } from "./LetterReader";

/**
 * The grid and what the network makes of it. The cells are buttons so they
 * can be pressed with a finger or a keyboard; the build writes them before
 * any script can answer a press.
 */
export function renderLetters(reader: LetterReader, pixels: readonly number[]): string {
  const cells = pixels.map((pixel, at) => `<button type="button" class="cell" data-at="${at}" aria-pressed="${pixel ? "true" : "false"}" aria-label="cell ${at + 1}"></button>`).join("");
  const answers = reader.read(pixels);
  const best = answers.reduce((a, b) => (b.score > a.score ? b : a));
  const rows = answers
    .map(({ letter, score }) => `<tr${letter === best.letter ? ' class="best"' : ""}><th scope="row">${escapeHtml(letter)}</th><td class="sure"><span class="bar" style="--p:${score.toFixed(3)}"></span>${Math.round(score * 100)}%</td></tr>`)
    .join("");
  const verdict =
    reader.rounds === 0
      ? "It has not been taught anything yet: every answer is a guess."
      : `It reads <b>${escapeHtml(best.letter)}</b>, after ${reader.rounds} rounds of lessons.`;
  return `<div class="letters"><div class="grid" role="group" aria-label="the drawing, five cells by five">${cells}</div><div class="reading"><p>${verdict}</p><table class="answers"><tbody>${rows}</tbody></table></div></div>`;
}
