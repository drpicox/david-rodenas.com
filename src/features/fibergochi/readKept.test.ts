import { describe, expect, it } from "vitest";
import { randomOf } from "../../platform/random/randomOf";
import { Fibergochi } from "./Fibergochi";
import { readKept } from "./readKept";

describe("a Fibergochi read back from the browser", () => {
  it("is the one that was kept", () => {
    const fibergochi = new Fibergochi(randomOf(3));
    for (let n = 0; n < 300; n += 1) fibergochi.step();
    expect(readKept(JSON.stringify(fibergochi.state))).toEqual(fibergochi.state);
  });

  it("comes back from the bar, with its friends and its stress", () => {
    const fibergochi = new Fibergochi(randomOf(3), { friends: 80, stress: 12 });
    fibergochi.goToBar();
    expect(readKept(JSON.stringify(fibergochi.state))).toEqual(fibergochi.state);
  });

  it("is none when nothing was kept, or what was kept is not a Fibergochi", () => {
    expect(readKept(null)).toBeNull();
    expect(readKept("{")).toBeNull();
    expect(readKept("[1,2]")).toBeNull();
    expect(readKept(JSON.stringify({ ...new Fibergochi(randomOf(3)).state, day: "monday" }))).toBeNull();
    expect(readKept(JSON.stringify({ ...new Fibergochi(randomOf(3)).state, exams: [1, 2] }))).toBeNull();
    expect(readKept(JSON.stringify({ ...new Fibergochi(randomOf(3)).state, doing: "dancing" }))).toBeNull();
    const { stress: _, ...february } = new Fibergochi(randomOf(3)).state;
    expect(readKept(JSON.stringify(february))).toBeNull();
  });
});
