import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { renderGenieRun } from "./renderGenieRun";
import { runGenie } from "./runGenie";

/** A file the reader may edit in the page, or, before any script, the same words to read. */
function file(name: string, key: string, text: string, rows: number, editable: boolean): string {
  const body = editable
    ? `<textarea class="genie-source" data-genie="${key}" rows="${rows}" spellcheck="false" autocapitalize="off" aria-label="${escapeHtml(name)}">${escapeHtml(text)}</textarea>`
    : `<pre class="genie-source">${escapeHtml(text)}</pre>`;
  return `<figure class="kata-file"><figcaption>${escapeHtml(name)}</figcaption>${body}</figure>`;
}

/**
 * The feature and its steps side by side with what Gherkin Genie makes of
 * them: the same frame for the still and for the page, which only swaps
 * the words to read for words to edit.
 */
export function renderGenie(feature: string, steps: string, editable: boolean): string {
  return (
    `<div class="genie"><div class="genie-in">${file("cucumbers.feature", "feature", feature, 7, editable)}${file("steps.js", "steps", steps, 10, editable)}</div>` +
    `<figure class="kata-file genie-out"><figcaption>npm test</figcaption><div class="genie-output">${renderGenieRun(runGenie(feature, steps))}</div></figure></div>`
  );
}
