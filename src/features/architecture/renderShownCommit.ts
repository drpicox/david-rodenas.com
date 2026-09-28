import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { Commit } from "./History";

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });

/** The commit the figures of the page stand at: how far into the history it is, a way to its changes on GitHub, when, and what it said it did. */
export function renderShownCommit(commits: readonly Commit[], at: number): string {
  const commit = commits[at];
  if (!commit) return "";
  const where = at === commits.length - 1 ? `the last of ${commits.length} commits` : `commit ${at + 1} of ${commits.length}`;
  const sha = escapeHtml(commit.sha);
  return `${where}: <a href="https://github.com/drpicox/david-rodenas.com/commit/${sha}" target="_blank" rel="noopener noreferrer"><code>${sha}</code></a> ${day.format(new Date(commit.date))} — ${escapeHtml(commit.subject)}`;
}
