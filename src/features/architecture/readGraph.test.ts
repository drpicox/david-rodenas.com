import { describe, expect, it } from "vitest";
import { readGraph } from "./readGraph";

const sources = [
  { path: "main.ts", text: 'import { shell } from "./platform/shell";\nimport { Theme } from "./features/theme/Theme";\nimport "./styles.css";' },
  { path: "platform/shell/index.ts", text: 'import type { Page } from "../content/Page";\nexport const shell = 1;\n' },
  { path: "platform/content/Page.ts", text: "export interface Page {}\n" },
  { path: "features/theme/Theme.ts", text: 'import { el } from "virtual:site";\nexport class Theme {}\n' },
  { path: "features/theme/Theme.test.ts", text: 'import { Theme } from "./Theme";\n' },
];

describe("the graph of the source", () => {
  const graph = readGraph(sources);

  it("has a module for every file, with its length, and knows which are tests", () => {
    expect(graph.modules).toContainEqual({ path: "platform/shell/index.ts", lines: 3, test: false });
    expect(graph.modules).toContainEqual({ path: "features/theme/Theme.test.ts", lines: 2, test: true });
  });

  it("resolves an import to the file it names, a folder to its index, and keeps whether it needs only a type", () => {
    expect(graph.dependencies).toEqual([
      { from: "main.ts", to: "platform/shell/index.ts", typeOnly: false },
      { from: "main.ts", to: "features/theme/Theme.ts", typeOnly: false },
      { from: "platform/shell/index.ts", to: "platform/content/Page.ts", typeOnly: true },
      { from: "features/theme/Theme.test.ts", to: "features/theme/Theme.ts", typeOnly: false },
    ]);
  });

  it("leaves out what is not source: a stylesheet, a package, a virtual module", () => {
    expect(graph.dependencies.map((dependency) => dependency.to)).not.toContain("styles.css");
  });
});
