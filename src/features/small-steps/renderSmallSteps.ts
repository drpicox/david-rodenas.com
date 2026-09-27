import type { Mark } from "./smallStepsFrames";

/** One frame of the row, as markup: a mark a place, its state its class. */
export function renderSmallSteps(marks: readonly Mark[]): string {
  const items = marks.map((mark) => `<li class="${mark}"></li>`).join("");
  return `<ol class="small-steps" role="img" aria-label="Small steps: a test fails and is put right at once; clean steps between; again and again">${items}</ol>`;
}
