import { describe, expect, it } from "vitest";
import { aProgram } from "./aProgram";
import { sliderOf } from "./sliderOf";

const [sum, rate] = aProgram.parameters;

describe("where a value stands on its dial", () => {
  it("stands where it is, on a plain dial", () => {
    const dial = sliderOf(rate!);
    expect([dial.min, dial.max, dial.step, dial.positionOf(7), dial.valueAt(7)]).toEqual([0, 20, 0.5, 7, 7]);
  });

  it("stands at its logarithm, on a dial that spans too many sizes", () => {
    const dial = sliderOf(sum!);
    expect([dial.min, dial.max, dial.positionOf(1000)]).toEqual([0, 6, 3]);
    expect(dial.valueAt(2)).toBeCloseTo(100);
  });
});
