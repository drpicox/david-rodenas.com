import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { Commit } from "./History";
import type { Metrics } from "./Metrics";

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });
const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

/** Under the picture: which commit it is, when, what it said it did, and what the source measured then. */
export function renderArchitectureCaption(commit: Commit, metrics: Metrics): string {
  const measured = [
    `${plural(metrics.files, "file")} in ${plural(metrics.boxes, "box", "boxes")}, ${plural(metrics.tests, "test")}`,
    `${plural(metrics.crossing, "arrow")} between boxes, ${metrics.typeOnly} of all ${metrics.arrows} onto a type`,
    `a test reaches ${metrics.tested} of the ${metrics.testable} files with something to test`,
    metrics.inCycles ? `${plural(metrics.inCycles, "box", "boxes")} in a circle` : "no boxes in a circle",
  ].join(" · ");
  return `<code>${escapeHtml(commit.sha)}</code> ${day.format(new Date(commit.date))} — ${escapeHtml(commit.subject)}<br><span class="measured">${measured}</span>`;
}
