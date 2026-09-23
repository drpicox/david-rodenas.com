import { describe, expect, it } from "vitest";
import { playRound } from "./playRound";

describe("a round on the lagoon", () => {
  it("breeds half as many again each week when nobody fishes: 3, 4, 6, 9, 13, 19, 28, 42, 63, 94", () => {
    const round = playRound(3, 9, { rest: [0, 0, 0, 0, 0, 0, 0, 0, 0] });
    expect(round.weeks.map((week) => week.fish)).toEqual([4, 6, 9, 13, 19, 28, 42, 63, 94]);
    expect(round.totals.rest).toBe(0);
  });

  it("serves the smaller order first, and splits what is left between equal orders", () => {
    // 9 fish; one wants 2, two want 7: the 2 is served whole, the 7 left is split 3 and 3, and the odd one breeds.
    const round = playRound(9, 1, { small: [2], big: [7], other: [7] });
    expect(round.weeks[0]!.caught).toEqual({ small: 2, big: 3, other: 3 });
    expect(round.weeks[0]!.fish).toBe(1);
  });

  it("gives a bot no more than it asked, and nothing when it rests", () => {
    const round = playRound(100, 2, { one: [1, 1], rest: [0, 0] });
    expect(round.totals).toEqual({ one: 2, rest: 0 });
    // 99 breeds to 148, less one is 147, breeds to 220.
    expect(round.weeks.map((week) => week.fish)).toEqual([148, 220]);
  });

  it("lets a lagoon be fished out, after which there is nothing to breed", () => {
    const round = playRound(10, 3, { greedy: [10, 10, 10] });
    expect(round.weeks.map((week) => week.fish)).toEqual([0, 0, 0]);
    expect(round.totals.greedy).toBe(10);
  });
});
