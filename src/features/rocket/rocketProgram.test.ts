import { describe, expect, it } from "vitest";
import { initialValues } from "../../platform/program/initialValues";
import { settleValues } from "../../platform/program/settleValues";
import { rocketProgram } from "./rocketProgram";

const run = (given: Record<string, unknown> = {}) => {
  const settled = settleValues(rocketProgram, given);
  if ("error" in settled) throw new Error(settled.error);
  return rocketProgram.run(settled.values);
};

interface Trip {
  readonly to: string;
  readonly onBoardYears: number;
  readonly atHomeYears: number;
  readonly topSpeed: number;
  readonly coasts: boolean;
}

describe("the rocket, as a program", () => {
  it("opens with the first ship, flying to the nearest star", () => {
    expect(initialValues(rocketProgram)).toEqual({ acceleration: 0.3, fuel: 0.2, exhaust: 72, to: "Proxima Centauri" });
  });

  it("says the chosen trip in words: both clocks, the top speed, and whether it coasts", () => {
    expect(run().text).toMatch(/^to Proxima Centauri, 4\.24 light-years: .+ on board, .+ at home, top speed .+ of c, all 5,000 t of fuel, then coasts$/);
  });

  it("is told where to go by the word a command line writes it as", () => {
    expect(run({ to: "tau-ceti" }).text).toMatch(/^to Tau Ceti, 11\.91 light-years/);
  });

  it("gives an agent every trip in figures: years on each clock, and the top speed as a share of light", () => {
    const { trips } = run({ acceleration: 1, fuel: 1e12, exhaust: 100 }).data as { trips: Trip[] };
    const proxima = trips.find((trip) => trip.to === "Proxima Centauri");
    expect(trips).toHaveLength(11);
    expect(proxima?.onBoardYears).toBeCloseTo(3.5, 1);
    expect(proxima?.atHomeYears).toBeGreaterThan(5.5);
    expect(proxima?.coasts).toBe(false);
  });

  it("draws the table of trips the page always drew, with the chosen one marked", () => {
    expect(run({ to: "Sirius" }).html).toContain('<tr class="chosen coasts" data-destination="Sirius"');
  });
});
