import { escapeHtml } from "../markdown/escapeHtml";
import type { RunningYear } from "./RunningYear";

/** What a yearly source's index says about itself. */
export interface SourceIndex {
  readonly attribution: string;
  readonly dataset: string;
  readonly years: readonly number[];
  /** The day the copy was last added to, as YYYY-MM-DD. */
  readonly refreshed: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Open data comes with terms, and they are nearly always these: say whose it
 * is, and say how old your copy is. Written from the index the refresh keeps,
 * so the line is never older than the data.
 */
export function renderSourceLine(index: SourceIndex, running: Omit<RunningYear<unknown>, "files"> | null = null): string {
  const shown = running && !index.years.includes(running.year) ? running : null;
  const refreshed = shown && shown.refreshed > index.refreshed ? shown.refreshed : index.refreshed;
  const [year, month, day] = refreshed.split("-").map(Number);
  const copied = `${day} ${MONTHS[(month ?? 1) - 1]} ${year}`;
  const span = `${Math.min(...index.years)} to ${Math.max(...index.years)}`;
  const [, upToMonth, upToDay] = shown?.through.split("-").map(Number) ?? [];
  const soFar = shown ? `, and ${shown.year} so far, to ${upToDay} ${MONTHS[(upToMonth ?? 1) - 1]}` : "";
  return `<p class="source">Source: ${escapeHtml(index.attribution)} <a href="${escapeHtml(index.dataset)}">The dataset, at its source.</a> This site keeps sums of the finished years ${span}${soFar}, last added to on ${copied}.</p>`;
}
