import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { highlight } from "../../platform/markdown/highlight";
import { renderGenieRun } from "./renderGenieRun";
import { runGenie } from "./runGenie";

/**
 * A file, coloured as its language. Before any script, the coloured words to
 * read; in the page, the words to edit laid over their coloured copy, which
 * the browser keeps in step as they are typed.
 */
function file(name: string, key: string, language: string, text: string, rows: number, editable: boolean): string {
  const coloured = `<code>${highlight(text, language)}</code>`;
  const body = editable
    ? `<div class="genie-editor"><pre class="genie-source genie-colours" aria-hidden="true">${coloured}</pre><textarea class="genie-source" data-genie="${key}" data-language="${language}" rows="${rows}" spellcheck="false" autocapitalize="off" aria-label="${escapeHtml(name)}">${escapeHtml(text)}</textarea></div>`
    : `<pre class="genie-source">${coloured}</pre>`;
  return `<figure class="kata-file"><figcaption>${escapeHtml(name)}</figcaption>${body}</figure>`;
}

/**
 * The feature and its steps side by side with what Gherkin Genie makes of
 * them: the same frame for the still and for the page, which only swaps
 * the words to read for words to edit.
 */
export function renderGenie(feature: string, steps: string, editable: boolean): string {
  return (
    `<div class="genie"><div class="genie-in">${file("cucumbers.feature", "feature", "gherkin", feature, 7, editable)}${file("steps.js", "steps", "js", steps, 10, editable)}</div>` +
    `<figure class="kata-file genie-out"><figcaption>npm test</figcaption><div class="genie-output">${renderGenieRun(runGenie(feature, steps))}</div></figure></div>`
  );
}
