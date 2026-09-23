import { describe, expect, it } from "vitest";
import { starters } from "./starters";
import { titForTat } from "./titForTat";
import { Tournament } from "./Tournament";

describe("a season of rounds on one lagoon", () => {
  it("plays a round when asked, with every bot's orders given before it starts, and keeps the score", () => {
    const season = new Tournament(19, 10, [starters.one, starters.power]);
    season.play();
    expect(season.rounds).toHaveLength(1);
    expect(season.rounds[0]!.orders.Power).toEqual([0, 1, 4, 9, 16, 25, 36, 49, 64, 81]);
    // Power fishes the lagoon out in week 7, so even the bot that only ever took one goes home short.
    expect(season.scores().One).toBe(8);
  });

  it("shows each bot the rounds before, which is how tit for tat comes to know a traitor", () => {
    const season = new Tournament(19, 10, [titForTat(), starters.percent(0.6)]);
    season.play();
    season.play();
    const [trusting, wary] = season.rounds;
    expect(trusting!.orders["Tit for tat"]!.slice(0, 9)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(wary!.orders["Tit for tat"]![0]).toBeGreaterThan(0);
  });

  it("takes a bot that throws, or answers nonsense, as one that rests, and says so", () => {
    const broken = { name: "Broken", orders: () => JSON.parse("{") as number[] };
    const season = new Tournament(19, 3, [broken, starters.one]);
    season.play();
    expect(season.rounds[0]!.orders.Broken).toEqual([0, 0, 0]);
    expect(season.errors.Broken).toMatch(/JSON/);
  });
});
