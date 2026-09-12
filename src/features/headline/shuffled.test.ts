import { describe, expect, it } from "vitest";
import { shuffled } from "./shuffled";

describe("shuffled", () => {
  it("keeps every item exactly once", () => {
    let seed = 7;
    const random = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    expect([...shuffled(["a", "b", "c", "d"], random)].sort()).toEqual(["a", "b", "c", "d"]);
  });

  it("can put the last item first, so no order is out of reach", () => {
    expect(shuffled(["a", "b", "c"], () => 0)).toEqual(["b", "c", "a"]);
    expect(shuffled(["a", "b", "c"], () => 0.999)).toEqual(["a", "b", "c"]);
  });
});
