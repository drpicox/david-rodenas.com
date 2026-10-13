import { describe, expect, it } from "vitest";
import type { Bench } from "./Bench";
import { benchOf } from "./benchOf";
import type { Feature } from "./Feature";

const bench = (): Bench => ({ element: {} as HTMLElement, placed() {}, wake() {}, open() {}, ask() {}, stop() {} });

describe("the bench a blueprint in a page opens at, when a feature brings another", () => {
  const console1 = () => bench();
  const console2 = () => bench();
  const features: Feature[] = [{ name: "plain" }, { name: "one", benches: { one: console1 } }, { name: "two", benches: { two: console2 } }];

  it("is none while no flag that asks for one is on: the frame's own workbench stays", () => {
    expect(benchOf(features, () => false)).toBeUndefined();
    expect(benchOf(features, (flag) => flag === "plain")).toBeUndefined();
  });

  it("is the one whose flag is on", () => {
    expect(benchOf(features, (flag) => flag === "two")).toBe(console2);
  });

  it("is the first installed, where two are asked for at once", () => {
    expect(benchOf(features, () => true)).toBe(console1);
  });
});
