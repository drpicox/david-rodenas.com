import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Table } from "../../../platform/blueprint/Table";
import { metricsOf } from "../metricsOf";
import { historyIn } from "./historyIn";

/** A commit's subject as a line: its first sentence, cut short. */
const subjectOf = (text: string) => {
  const first = text.split(/(?<=\.)\s/)[0] ?? text;
  return first.length > 90 ? `${first.slice(0, 89)}…` : first;
};

/**
 * The history itself, a row a commit that changed the source: when, what it
 * said it did, how many files it changed, and what the source measured
 * afterwards — files, tests, lines, arrows, the arrows across boxes, the
 * files a test reaches.
 */
export const commitsNode: NodeKind = {
  name: "commits",
  title: "Commits",
  role: "source",
  shelf: "This site",
  summary: "This site's history, a row a commit: when, what it said, how many files it changed, and the files, tests, lines and arrows after it.",
  inputs: [],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (_inputs, { read }) => {
    const { history, snapshots } = historyIn(read);
    const rows = history.commits.map((commit, at) => {
      const metrics = metricsOf(snapshots[at] ?? { modules: [], dependencies: [] });
      return {
        commit: at,
        date: commit.date.slice(0, 10),
        changed: history.changes[at]?.changed.length ?? 0,
        files: metrics.files,
        tests: metrics.tests,
        lines: metrics.lines,
        arrows: metrics.arrows,
        crossing: metrics.crossing,
        tested: metrics.tested,
        subject: subjectOf(commit.subject),
      };
    });
    const table: Table = {
      columns: [
        { name: "commit", kind: "number", key: true, about: "its place in the history, from 0" },
        { name: "date", kind: "text" },
        { name: "changed", kind: "number", about: "the files it changed" },
        { name: "files", kind: "number", about: "the files that ship, after it" },
        { name: "tests", kind: "number" },
        { name: "lines", kind: "number" },
        { name: "arrows", kind: "number", about: "the arrows between files that ship" },
        { name: "crossing", kind: "number", about: "the arrows from one box into another" },
        { name: "tested", kind: "number", about: "the files a test imports directly" },
        { name: "subject", kind: "text" },
      ],
      rows,
      credits: [{ said: "This site's own history, read by the TypeScript compiler at every commit." }],
    };
    return { outputs: { table } };
  },
};
