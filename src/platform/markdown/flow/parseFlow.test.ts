import { describe, expect, it } from "vitest";
import { parseFlow } from "./parseFlow";

describe("parseFlow", () => {
  it("reads nodes with labels, and edges between them", () => {
    const flow = parseFlow("A[post.md] --> B[create-tests]\nB --> C[Post_Test.java]");
    expect(flow.nodes).toEqual([
      { id: "A", label: "post.md" },
      { id: "B", label: "create-tests" },
      { id: "C", label: "Post_Test.java" },
    ]);
    expect(flow.edges).toEqual([
      { from: "A", to: "B" },
      { from: "B", to: "C" },
    ]);
  });

  it("uses the id as the label when none is given", () => {
    expect(parseFlow("mvn --> jest").nodes).toEqual([
      { id: "mvn", label: "mvn" },
      { id: "jest", label: "jest" },
    ]);
  });

  it("reads an edge's label between bars", () => {
    expect(parseFlow("A -->|replays, in order| B").edges).toEqual([{ from: "A", to: "B", label: "replays, in order" }]);
  });

  it("labels a node once, wherever the label is given", () => {
    const flow = parseFlow("A --> B\nB[the second] --> C\nA[the first]");
    expect(flow.nodes).toEqual([
      { id: "A", label: "the first" },
      { id: "B", label: "the second" },
      { id: "C", label: "C" },
    ]);
  });

  it("goes top-down unless the first line says otherwise", () => {
    expect(parseFlow("A --> B").direction).toBe("TD");
    expect(parseFlow("LR\nA --> B").direction).toBe("LR");
    expect(parseFlow("flow LR\nA --> B").direction).toBe("LR");
  });

  it("ignores blank lines and comments", () => {
    expect(parseFlow("\n% a note\nA --> B\n\n").edges).toEqual([{ from: "A", to: "B" }]);
  });

  it("lets a label break into two lines with a bar-less newline mark", () => {
    expect(parseFlow("A[every request\\nsaved on green] --> B").nodes[0]?.label).toBe("every request\nsaved on green");
  });

  it("refuses a line it cannot read, and says which", () => {
    expect(() => parseFlow("A --> B\nthis is not a line")).toThrow(/line 2/);
  });
});
