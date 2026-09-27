import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { KataStep } from "./KataStep";
import { runKata } from "./runKata";

/**
 * Every commit of the kata as one cell, numbered, red or green as its tests
 * ran, and paler for a clean step — the rhythm of test, code and clean seen
 * whole, before any of it is read.
 */
export function renderKataStrip(steps: readonly KataStep[], at: number): string {
  const cells = steps.map((step) => {
    const run = runKata(step.test, step.code);
    const colour = run.passed ? "green" : "red";
    const title = `commit ${step.commit} · ${step.stage} · ${run.passed ? "All tests pass." : run.message}`;
    const here = step.commit === at;
    return `<li class="${colour} ${step.stage}${here ? " here" : ""}" data-commit="${step.commit}" title="${escapeHtml(title)}"${here ? ' aria-current="step"' : ""}>${step.commit}</li>`;
  });
  const legend = '<p class="kata-legend"><span class="red">a test fails</span> <span class="green code">all pass</span> <span class="green clean">a clean step: all still pass</span></p>';
  return `<ol class="kata-strip" aria-label="The commits of the kata, red or green">${cells.join("")}</ol>${legend}`;
}
