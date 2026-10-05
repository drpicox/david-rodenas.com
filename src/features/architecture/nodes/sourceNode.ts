import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { dayOf } from "../dayOf";
import type { CodeGraph } from "./CodeGraph";
import { historyIn } from "./historyIn";

const NOTHING = { modules: [], dependencies: [] };

/**
 * This site's source as a graph, at any commit of its history: a node a
 * file, an arrow a file that needs another, read by the TypeScript compiler
 * at every commit that changed the source. The tests are left out unless
 * asked for: they are what reaches the files, not files of the design.
 */
export const sourceNode: NodeKind = {
  name: "source",
  title: "The source",
  role: "source",
  shelf: "This site",
  summary: "This site's own source as a graph, at any commit of its history: a node a file, an arrow a file that needs another.",
  inputs: [
    {
      name: "commit",
      label: "commit",
      type: "number",
      optional: true,
      editor: (read) => {
        const { history } = historyIn(read);
        const last = history.commits.length - 1;
        return { kind: "number", min: 0, max: last, step: 1, show: (at) => (history.commits[at] ? `${dayOf(history.commits[at])}, ${at === last ? "the last" : `commit ${at + 1} of ${last + 1}`}` : "") };
      },
      hint: "which commit of the history, counted from 0; the last when left empty",
    },
    { name: "tests", label: "with the tests", type: "flag", initial: false, editor: { kind: "flag" } },
  ],
  outputs: [{ name: "graph", label: "graph", type: "graph" }],
  run: (inputs, { read }) => {
    const history = historyIn(read);
    const last = history.snapshots.length - 1;
    const at = inputs["commit"] === undefined ? last : Math.round(Number(inputs["commit"]));
    if (at < 0 || at > last) throw new Error(`commit: the history runs from 0 to ${last}`);
    const whole = history.snapshots[at] ?? NOTHING;
    const kept = new Set(whole.modules.filter((module) => inputs["tests"] === true || !module.test).map((module) => module.id));
    const snapshot = { modules: whole.modules.filter((module) => kept.has(module.id)), dependencies: whole.dependencies.filter(({ from, to }) => kept.has(from) && kept.has(to)) };
    const graph: CodeGraph = { snapshot, of: "files", measured: [], read: history, at };
    const commit = history.history.commits[at];
    return { outputs: { graph }, settled: { commit: at }, said: `${snapshot.modules.length} files · ${snapshot.dependencies.length} arrows${commit ? ` · ${dayOf(commit)}` : ""}` };
  },
};
