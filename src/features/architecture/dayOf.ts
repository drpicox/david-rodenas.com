import type { Commit } from "./History";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The day a commit was made on, as its author lived it — the date is written in their own time — and short: `12 Sep`. */
export function dayOf(commit: Commit): string {
  const [, month = 1, day = 1] = commit.date.slice(0, 10).split("-").map(Number);
  return `${day} ${MONTHS[month - 1] ?? ""}`;
}
