import { describe, expect, it } from "vitest";
import { playRound } from "./playRound";
import { starters } from "./starters";
import { titForTat } from "./titForTat";

const bots = ["Tit", "Other"];

describe("tit for tat on the lagoon", () => {
  it("rests all round and takes its share the last week, while nobody has betrayed it", () => {
    expect(titForTat().orders(19, 4, bots, "Tit", [])).toEqual([0, 0, 0, 31]);
  });

  it("marks as a traitor whoever took a full share or more in the first week of the round before", () => {
    const tit = titForTat();
    const greedy = playRound(19, 2, { Tit: [0, 14], Other: [10, 10] });
    expect(tit.orders(19, 2, bots, "Tit", [greedy])).toEqual([10, 7]);
  });

  it("forgives nobody: a bot that once betrayed stays a traitor", () => {
    const tit = titForTat();
    const greedy = playRound(19, 2, { Tit: [0, 14], Other: [10, 10] });
    const meek = playRound(19, 2, { Tit: [10, 7], Other: [0, 0] });
    expect(tit.orders(19, 2, bots, "Tit", [greedy, meek])).toEqual([10, 7]);
  });

  it("does better with its own kind than either does against Power, which is what the lab was for", () => {
    const pair = playRound(19, 10, { A: titForTat().orders(19, 10, ["A", "B"], "A", []), B: titForTat().orders(19, 10, ["A", "B"], "B", []) });
    const mixed = playRound(19, 10, { A: titForTat().orders(19, 10, ["A", "P"], "A", []), P: starters.power.orders(19, 10, ["A", "P"], "P", []) });
    expect(pair.totals.A).toBeGreaterThan(mixed.totals.A!);
    expect(pair.totals.A).toBeGreaterThan(mixed.totals.P!);
  });
});
