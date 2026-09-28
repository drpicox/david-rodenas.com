import { describe, expect, it } from "vitest";
import { renderShownCommit } from "./renderShownCommit";

const commits = [
  { sha: "aaaaaaa", date: "2026-09-07T10:00:00+02:00", subject: "The first page" },
  { sha: "bbbbbbb", date: "2026-09-08T11:00:00+02:00", subject: "The folders say <what> the site is" },
  { sha: "ccccccc", date: "2026-09-09T11:00:00+02:00", subject: "The third" },
];

describe("the commit every figure of the page is showing", () => {
  it("says which it is, how far into the history, when, and what it said it did, with a way to its changes", () => {
    const line = renderShownCommit(commits, 1);
    expect(line).toContain("commit 2 of 3");
    expect(line).toContain('<a href="https://github.com/drpicox/david-rodenas.com/commit/bbbbbbb" target="_blank" rel="noopener noreferrer"><code>bbbbbbb</code></a>');
    expect(line).toContain("8 September 2026 — The folders say &lt;what&gt; the site is");
  });

  it("says it is the last, when it is", () => {
    expect(renderShownCommit(commits, 2)).toContain("the last of 3 commits");
  });
});
