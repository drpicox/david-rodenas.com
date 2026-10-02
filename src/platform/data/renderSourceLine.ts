import { escapeHtml } from "../markdown/escapeHtml";
import { dayAndMonthOf } from "./dayAndMonthOf";
import type { RunningYear } from "./RunningYear";

/** What a yearly source's index says about itself. */
export interface SourceIndex {
  readonly attribution: string;
  readonly dataset: string;
  readonly years: readonly number[];
  /** The day the copy was last added to, as YYYY-MM-DD. */
  readonly refreshed: string;
}

/**
 * Open data comes with terms, and they are nearly always these: say whose it
 * is, and say how old your copy is. Written from the index the refresh keeps,
 * so the line is never older than the data.
 */
export function renderSourceLine(index: SourceIndex, running: Omit<RunningYear<unknown>, "files"> | null = null): string {
  const shown = running && !index.years.includes(running.year) ? running : null;
  const refreshed = shown && shown.refreshed > index.refreshed ? shown.refreshed : index.refreshed;
  const copied = `${dayAndMonthOf(refreshed)} ${refreshed.slice(0, 4)}`;
  const span = `${Math.min(...index.years)} to ${Math.max(...index.years)}`;
  const soFar = shown ? `, and ${shown.year} so far, to ${dayAndMonthOf(shown.through)}` : "";
  return `<p class="source">Source: ${escapeHtml(index.attribution)} <a href="${escapeHtml(index.dataset)}">The dataset, at its source.</a> This site keeps sums of the finished years ${span}${soFar}, last added to on ${copied}.</p>`;
}
