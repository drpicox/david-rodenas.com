import { describe, expect, it } from "vitest";
import { propagationCostOf } from "./propagationCostOf";
import type { Snapshot } from "./Snapshot";

const module = (id: number, test = false) => ({ id, path: `${id}.ts`, lines: 10, test });
const needs = (from: number, to: number) => ({ from, to, typeOnly: false });

describe("how much of the source a change can reach, on average", () => {
  it("counts, for every file, itself and everything that needs it, near or far, over every file there is, squared", () => {
    // 0 needs 1, 1 needs 2: a change to 2 can reach all three, to 1 two of them, to 0 only itself.
    const chain: Snapshot = { modules: [module(0), module(1), module(2)], dependencies: [needs(0, 1), needs(1, 2)] };
    expect(propagationCostOf(chain)).toBeCloseTo(6 / 9);
  });

  it("is as small as it can be when nothing needs anything: every change stays where it is", () => {
    const islands: Snapshot = { modules: [module(0), module(1), module(2), module(3)], dependencies: [] };
    expect(propagationCostOf(islands)).toBe(1 / 4);
  });

  it("leaves the tests out, which reach everything and are reached by nothing", () => {
    const tested: Snapshot = { modules: [module(0), module(1), module(2, true)], dependencies: [needs(0, 1), needs(2, 0), needs(2, 1)] };
    expect(propagationCostOf(tested)).toBe(3 / 4);
  });

  it("is nothing for no source at all", () => {
    expect(propagationCostOf({ modules: [], dependencies: [] })).toBe(0);
  });
});
