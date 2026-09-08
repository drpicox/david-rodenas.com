export interface FlowNode {
  readonly id: string;
  readonly label: string;
}

export interface FlowEdge {
  readonly from: string;
  readonly to: string;
  readonly label?: string;
}

export interface Flow {
  readonly direction: "TD" | "LR";
  readonly nodes: readonly FlowNode[];
  readonly edges: readonly FlowEdge[];
}

/** `id`, or `id[a label]`. A `\n` in a label is a line break. */
const NODE = /(\w[\w.-]*)(?:\[([^\]]*)\])?/;
const EDGE = new RegExp(`^${NODE.source}\\s*-->(?:\\|([^|]*)\\|)?\\s*${NODE.source}$`);
const ALONE = new RegExp(`^${NODE.source}$`);
const DIRECTION = /^(?:flow\s+)?(TD|LR)$/i;

/**
 * Reads the small flowchart language the pages draw in — a subset of the one
 * Mermaid uses, so that a diagram written here would read the same there:
 *
 *     A[post.md] --> B[create-tests]
 *     B -->|writes| C[Post_Test.java]
 *
 * Nodes come out in the order they were first mentioned, which is the order
 * the layout will lean on when nothing else decides.
 */
export function parseFlow(source: string): Flow {
  const nodes = new Map<string, string>();
  const edges: FlowEdge[] = [];
  let direction: "TD" | "LR" = "TD";

  const mention = (id: string | undefined, label: string | undefined) => {
    if (!id) return;
    if (!nodes.has(id)) nodes.set(id, id);
    if (label !== undefined) nodes.set(id, label.replace(/\\n/g, "\n"));
  };

  const lines = source.split("\n");
  let first = true;
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (line === "" || line.startsWith("%")) return;
    if (first) {
      first = false;
      const heading = DIRECTION.exec(line);
      if (heading) {
        direction = heading[1]?.toUpperCase() === "LR" ? "LR" : "TD";
        return;
      }
    }
    const edge = EDGE.exec(line);
    if (edge) {
      const [, from, fromLabel, label, to, toLabel] = edge;
      mention(from, fromLabel);
      mention(to, toLabel);
      edges.push(label === undefined ? { from: from ?? "", to: to ?? "" } : { from: from ?? "", to: to ?? "", label });
      return;
    }
    const alone = ALONE.exec(line);
    if (alone) {
      mention(alone[1], alone[2]);
      return;
    }
    throw new Error(`flow: cannot read line ${index + 1}: "${line}"`);
  });

  return {
    direction,
    nodes: [...nodes].map(([id, label]) => ({ id, label })),
    edges,
  };
}
