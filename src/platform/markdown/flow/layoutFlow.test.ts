import { describe, expect, it } from "vitest";
import { layoutFlow } from "./layoutFlow";
import { parseFlow } from "./parseFlow";

const lay = (source: string) => layoutFlow(parseFlow(source));
const box = (layout: ReturnType<typeof layoutFlow>, id: string) => {
  const node = layout.nodes.find((n) => n.id === id);
  if (!node) throw new Error(`no node ${id}`);
  return node;
};
const overlap = (a: { x: number; y: number; width: number; height: number }, b: typeof a) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

describe("layoutFlow", () => {
  it("stacks a chain top-down, each below the last, in one column", () => {
    const layout = lay("A --> B\nB --> C");
    const [a, b, c] = ["A", "B", "C"].map((id) => box(layout, id));
    expect(a!.y).toBeLessThan(b!.y);
    expect(b!.y).toBeLessThan(c!.y);
    expect(a!.x + a!.width / 2).toBeCloseTo(b!.x + b!.width / 2, 0);
    expect(layout.height).toBeGreaterThan(c!.y + c!.height);
  });

  it("puts a fork side by side on one row, without overlapping", () => {
    const layout = lay("A --> B\nA --> C\nB --> D\nC --> D");
    const [b, c, d] = ["B", "C", "D"].map((id) => box(layout, id));
    expect(b!.y).toBe(c!.y);
    expect(overlap(b!, c!)).toBe(false);
    expect(d!.y).toBeGreaterThan(b!.y);
  });

  it("makes room for every box: no two ever overlap", () => {
    const layout = lay("A --> B\nA --> C\nA --> D\nB --> E\nC --> E\nD --> E\nA --> E");
    for (const p of layout.nodes) for (const q of layout.nodes) if (p !== q) expect(overlap(p, q)).toBe(false);
  });

  it("routes an edge that skips rows around the boxes in between, not through them", () => {
    const layout = lay("A --> B\nB --> C\nC --> D\nA --> D");
    const long = layout.edges.find((e) => e.from === "A" && e.to === "D");
    if (!long) throw new Error("no long edge");
    // One waypoint per row it passes, so the path can step aside.
    expect(long.points.length).toBe(4);
    for (const [x, y] of long.points.slice(1, -1)) {
      for (const id of ["B", "C"]) {
        const n = box(layout, id);
        const inside = x >= n.x && x <= n.x + n.width && y >= n.y && y <= n.y + n.height;
        expect(inside).toBe(false);
      }
    }
  });

  it("starts an edge at the bottom of its source and ends at the top of its target", () => {
    const layout = lay("A --> B");
    const [a, b] = ["A", "B"].map((id) => box(layout, id));
    const edge = layout.edges[0]!;
    expect(edge.points[0]).toEqual([a!.x + a!.width / 2, a!.y + a!.height]);
    expect(edge.points.at(-1)).toEqual([b!.x + b!.width / 2, b!.y]);
  });

  it("lays a chain left to right when asked", () => {
    const layout = lay("LR\nA --> B\nB --> C");
    const [a, b, c] = ["A", "B", "C"].map((id) => box(layout, id));
    expect(a!.x).toBeLessThan(b!.x);
    expect(b!.x).toBeLessThan(c!.x);
    expect(a!.y).toBe(b!.y);
    expect(layout.edges[0]!.points[0]).toEqual([a!.x + a!.width, a!.y + a!.height / 2]);
  });

  it("sizes a box to its words, and a two-line label taller than one", () => {
    const layout = lay("A[hi] --> B[a much longer label]\nB --> C[two\\nlines]");
    const [a, b, c] = ["A", "B", "C"].map((id) => box(layout, id));
    expect(b!.width).toBeGreaterThan(a!.width);
    expect(c!.height).toBeGreaterThan(a!.height);
  });

  it("keeps the edge's label", () => {
    expect(lay("A -->|why| B").edges[0]!.label).toBe("why");
  });

  it("refuses a cycle, because a flow has a direction", () => {
    expect(() => lay("A --> B\nB --> A")).toThrow(/cycle/i);
  });
});
