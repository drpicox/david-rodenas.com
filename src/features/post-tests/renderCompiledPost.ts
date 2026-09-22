import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { highlight } from "../../platform/markdown/highlight";
import type { Compiled } from "./compilePost";

/** The two files, coloured, and what the compiler refused, if anything. */
export function renderCompiledPost(compiled: Compiled, file: string): string {
  const problems = compiled.problems.length
    ? `<div class="refused"><strong>${escapeHtml(file)}</strong> line ${compiled.problems[0]!.line}: ${escapeHtml(compiled.problems[0]!.message)}<br>The tests are not written until the post is fixed.</div>`
    : "";
  return (
    `<div class="compiled">${problems}` +
    `<h4>${escapeHtml(file.replace(/\.md$/, ""))} → the test, never edited by hand</h4><pre><code>${highlight(compiled.test, "js")}</code></pre>` +
    `<h4>→ the context, written once and filled in by the coder</h4><pre><code>${highlight(compiled.context, "js")}</code></pre></div>`
  );
}
