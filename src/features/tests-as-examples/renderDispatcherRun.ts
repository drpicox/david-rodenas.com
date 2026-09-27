import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { highlight } from "../../platform/markdown/highlight";
import type { Dispatcher } from "./Dispatcher";
import { runDispatcherTests } from "./runDispatcherTests";

/** Where each test of the essay stands: among the two that look inside, or alone, reading like documentation. */
const LOOKING_INSIDE = ["addListener should add a callback to the queue", "deliver should invoke queue callbacks with the received argument"];

/**
 * The essay's tests run against one way of writing the dispatcher: its code,
 * what changed in it, and each test red or green, the two that look inside
 * apart from the one that reads like documentation.
 */
export function renderDispatcherRun(dispatcher: Dispatcher): string {
  const run = runDispatcherTests(dispatcher.source);
  const item = (name: string) => {
    const result = run.results.find((one) => one.name === name);
    const passed = result?.passed ?? false;
    const said = passed ? "" : `<span class="said">${escapeHtml(result?.message ?? run.message ?? "")}</span>`;
    return `<li class="${passed ? "green" : "red"}"><code>${escapeHtml(name)}</code>${said}</li>`;
  };
  const documenting = run.results.map((result) => result.name).filter((name) => !LOOKING_INSIDE.includes(name));
  return (
    `<div class="dispatcher-run"><figure class="kata-file"><figcaption>dispatcher.js — ${escapeHtml(dispatcher.label.toLowerCase())}</figcaption>` +
    `<pre><code>${highlight(dispatcher.source, "js")}</code></pre></figure>` +
    `<div class="dispatcher-tests"><p class="said-change">${escapeHtml(dispatcher.said)}</p>` +
    `<h4>Looking inside</h4><ul class="test-results">${LOOKING_INSIDE.map(item).join("")}</ul>` +
    `<h4>Reading like documentation</h4><ul class="test-results">${documenting.map(item).join("")}</ul></div></div>`
  );
}
