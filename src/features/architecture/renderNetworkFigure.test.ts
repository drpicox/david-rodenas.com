import { describe, expect, it } from "vitest";
import { renderNetworkFigure } from "./renderNetworkFigure";
import type { Snapshot } from "./Snapshot";

const snapshot = (ids: number[], links: [number, number][], tests: number[] = []): Snapshot => ({
  modules: ids.map((id) => ({ id, path: `features/f/${id}.ts`, lines: 1, test: tests.includes(id) })),
  dependencies: links.map(([from, to]) => ({ from, to, typeOnly: false })),
});

// Three files need 0, 4 needs 1 and 2, 1 needs 2 as well, and 5 stands alone; the test is not the network.
const figure = renderNetworkFigure(snapshot([0, 1, 2, 3, 4, 5, 9], [[1, 0], [2, 0], [3, 0], [4, 1], [4, 2], [1, 2], [9, 0]], [9]));

describe("the figure of the network", () => {
  it("draws, on log scales, the share of files needed by so many or more, and the share needing so many or more", () => {
    expect(figure).toContain('<svg class="network tails"');
    expect(figure).toContain("needed by 1 or more: 3 files");
    expect(figure).toContain("needed by 3 or more: 1 file");
    expect(figure).toContain("needing 2 or more: 2 files");
    expect(figure).toContain("how many others: needed by, or needing (a log scale)");
  });

  it("names the most needed file, and the one that needs the most", () => {
    expect(figure).toContain("0.ts is needed by 3");
    expect(figure).toContain("1.ts needs 2");
  });

  it("sets its clustering and its paths against a random network as big, in a drawing of their own that can stand under the tails on a narrow screen", () => {
    expect(figure).toContain('<svg class="network chance"');
    expect(figure).toContain("times as clustered as a random network");
  });

  it("draws a network with no arrows yet without dividing by nothing", () => {
    expect(renderNetworkFigure(snapshot([0, 1], []))).not.toMatch(/NaN|Infinity|undefined/);
  });
});
