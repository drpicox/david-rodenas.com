import { describe, expect, it } from "vitest";
import { networkOf } from "./networkOf";
import type { Snapshot } from "./Snapshot";

const snapshot = (ids: number[], links: [number, number][], tests: number[] = []): Snapshot => ({
  modules: ids.map((id) => ({ id, path: `${id}.ts`, lines: 1, test: tests.includes(id) })),
  dependencies: links.map(([from, to]) => ({ from, to, typeOnly: false })),
});

// A triangle 0-1-2 where 1 and 2 need each other, 3 hanging off 2, and 4 alone; and a test.
const network = networkOf(snapshot([0, 1, 2, 3, 4, 9], [[0, 1], [1, 2], [2, 1], [0, 2], [3, 2], [9, 0]], [9]));

describe("the source as a network", () => {
  it("counts its files, its arrows, and how many of the arrows there could be there are", () => {
    expect(network).toMatchObject({ files: 5, arrows: 5, links: 4 });
    expect(network.density).toBeCloseTo(5 / 20);
    expect(network.meanDegree).toBeCloseTo((2 * 4) / 5);
  });

  it("counts its parts, and its circles of files that need each other", () => {
    expect(network).toMatchObject({ parts: 2, largestPart: 4, circles: 1, inCircles: 2 });
  });

  it("measures how far apart its files are, how clustered, how deep the knot and how tall the stack", () => {
    // 0 stands on the circle of 1 and 2, which stands on nothing more: one arrow tall.
    expect(network).toMatchObject({ diameter: 2, deepestCore: 2, tallest: 1 });
    expect(network.meanPath).toBeCloseTo(8 / 6);
    expect(network.clustering).toBeCloseTo((1 + 1 + 1 / 3 + 0 + 0) / 5);
  });

  it("counts the files nothing needs and the files that need nothing", () => {
    expect(network).toMatchObject({ sources: 3, sinks: 1 });
  });

  it("sets its clustering and its paths against a random network of as many files and links, and says how small a world it is", () => {
    // Two links of every four pairs there could be, the chance any two files are joined, is what such a network's clustering comes to.
    expect(network.randomClustering).toBeCloseTo(1.6 / 4);
    expect(network.randomPath).toBeCloseTo(Math.log(5) / Math.log(1.6));
    expect(network.smallWorld).toBeCloseTo(network.clustering / network.randomClustering / (network.meanPath / network.randomPath));
  });

  it("gives every file's degree in and out, for how they are spread", () => {
    expect([...network.neededBy].sort()).toEqual([0, 0, 0, 2, 3]);
    expect([...network.needs].sort()).toEqual([0, 1, 1, 1, 2]);
  });
});
