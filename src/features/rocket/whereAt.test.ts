import { describe, expect, it } from "vitest";
import { voyage } from "./voyage";
import { whereAt } from "./whereAt";

const LIGHT_YEAR = 9.4607e15;
const tireless = { dryMass: 1, fuel: 1e30, exhaust: 1, acceleration: 1 };
const small = { dryMass: 25000, fuel: 5000, exhaust: 0.72, acceleration: 0.3 };

describe("where the ship is, by its own clock", () => {
  for (const [name, ship] of [["burning all the way", tireless], ["coasting in between", small]] as const) {
    const metres = 4.24 * LIGHT_YEAR;
    const trip = voyage(metres, ship);

    it(`starts at home and ends at the star, with both clocks where the voyage says (${name})`, () => {
      expect(whereAt(trip, ship, 0)).toMatchObject({ along: 0, homeTime: 0, speed: 0 });
      const end = whereAt(trip, ship, trip.shipTime);
      expect(end.along).toBeCloseTo(1, 6);
      expect(end.homeTime / trip.homeTime).toBeCloseTo(1, 6);
      expect(end.speed).toBeCloseTo(0, 6);
    });

    it(`is halfway there at half its time, going as fast as it ever will (${name})`, () => {
      const middle = whereAt(trip, ship, trip.shipTime / 2);
      expect(middle.along).toBeCloseTo(0.5, 6);
      expect(middle.speed).toBeCloseTo(trip.topSpeed, 6);
    });
  }

  it("covers little ground at first: a quarter of the time is much less than a quarter of the way", () => {
    const trip = voyage(4.24 * LIGHT_YEAR, tireless);
    expect(whereAt(trip, tireless, trip.shipTime / 4).along).toBeLessThan(0.15);
  });
});
