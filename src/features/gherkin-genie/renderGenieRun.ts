import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { highlight } from "../../platform/markdown/highlight";
import type { GenieRun } from "./runGenie";

const bar = (passed: boolean, words: string) => `<p class="kata-bar ${passed ? "green" : "red"}">${escapeHtml(words)}</p>`;

/**
 * A run as the reader sees it: the wished steps exactly as Gherkin Genie
 * prints them, ready to copy; or, once every step has its method, each
 * scenario green or red with the runner's own words; or why nothing ran.
 */
export function renderGenieRun(run: GenieRun): string {
  if (run.error) return bar(false, run.error);
  if (run.wished) {
    // The first line is Genie speaking; what follows is the code it hands over, and reads as code.
    const [said = "", ...code] = run.wished.split("\n");
    return `<pre class="genie-wished">${escapeHtml(said)}\n${highlight(code.join("\n"), "js")}</pre>`;
  }
  const tests = run.run;
  if (!tests) return "";
  const items = tests.results.map(
    (result) => `<li class="${result.passed ? "green" : "red"}"><code>${escapeHtml(result.name)}</code>${result.passed ? "" : `<span class="said">${escapeHtml(result.message ?? "")}</span>`}</li>`,
  );
  return `${bar(tests.passed, tests.passed ? "Every scenario passes." : (tests.message ?? ""))}<ul class="test-results">${items.join("")}</ul>`;
}
