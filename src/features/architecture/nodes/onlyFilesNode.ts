import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { CodeGraph } from "./CodeGraph";
import { subgraphOf } from "./subgraphOf";

/** Whether a path is one a pattern asks for: words it contains, or a pattern with stars, as platform/* or *Node.ts. */
function matches(path: string, pattern: string): boolean {
  if (!pattern.includes("*")) return path.includes(pattern);
  const expression = new RegExp(`^${pattern.split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);
  return expression.test(path);
}

/** Only the files whose path a pattern asks for, or all but those: one box, the frame, every test. */
export const onlyFilesNode: NodeKind = {
  name: "only-files",
  title: "Only some files",
  role: "step",
  shelf: "This site",
  summary: "Only the files whose path is as asked — words it contains, or a pattern with stars, as platform/* — or every file but those.",
  inputs: [
    { name: "graph", label: "graph", type: "graph" },
    { name: "path", label: "path", type: "text", initial: "platform/", hint: "words the path contains, or a pattern with stars: features/*/browser/*" },
    { name: "keep", label: "keep", type: "text", initial: "matching", editor: { kind: "choice", choices: [{ value: "matching", label: "those" }, { value: "others", label: "all but those" }] } },
  ],
  outputs: [{ name: "graph", label: "graph", type: "graph" }],
  run: (inputs) => {
    const graph = inputs["graph"] as CodeGraph;
    const pattern = String(inputs["path"] ?? "");
    const wanted = inputs["keep"] !== "others";
    const keep = new Set(graph.snapshot.modules.filter((module) => matches(module.path, pattern) === wanted).map((module) => module.id));
    return { outputs: { graph: subgraphOf(graph, keep) }, said: `${keep.size} of ${graph.snapshot.modules.length} ${graph.of}` };
  },
};
