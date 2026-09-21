import { describe, expect, it } from "vitest";
import { voyage } from "./voyage";

const LIGHT_YEAR = 9.4607e15;
const YEAR = 365.25 * 86400;
/** A ship that never runs dry, at one g: the ship of John Baez's table. */
const tireless = { dryMass: 1, fuel: 1e30, exhaust: 1, acceleration: 1 };
const shipYears = (lightYears: number) => voyage(lightYears * LIGHT_YEAR, tireless).shipTime / YEAR;

describe("a voyage that speeds up to halfway and slows down the rest", () => {
  it("takes the ship's clock what the Usenet Physics FAQ's relativistic-rocket table says it takes", () => {
    expect(shipYears(4.3)).toBeCloseTo(3.6, 1);
    expect(shipYears(27)).toBeCloseTo(6.6, 1);
    expect(Math.round(shipYears(30000))).toBe(20);
    expect(Math.round(shipYears(2000000))).toBe(28);
  });

  it("takes the clocks left at home a little more than light would: the ship cannot beat it, only come close", () => {
    const trip = voyage(27 * LIGHT_YEAR, tireless);
    expect(trip.homeTime / YEAR).toBeGreaterThan(27);
    expect(trip.homeTime / YEAR).toBeLessThan(29.5);
    expect(trip.topSpeed).toBeLessThan(1);
    expect(trip.topSpeed).toBeGreaterThan(0.99);
  });

  it("is plain Newton when the trip is short: to the Moon at one g is a few hours on every clock", () => {
    const trip = voyage(384.4e6, tireless);
    expect(trip.shipTime / 3600).toBeCloseTo(3.48, 1);
    expect(trip.homeTime / trip.shipTime).toBeCloseTo(1, 6);
    expect(trip.coasts).toBe(false);
  });

  it("burns half the fuel it may, coasts, and keeps the other half to stop, when there is not enough to burn all the way", () => {
    const small = { dryMass: 25000, fuel: 5000, exhaust: 0.72, acceleration: 0.3 };
    const trip = voyage(4.24 * LIGHT_YEAR, small);
    expect(trip.coasts).toBe(true);
    expect(trip.fuelBurnt).toBe(5000);
    expect(trip.coastTime).toBeGreaterThan(0);
    expect(trip.shipTime).toBeLessThan(trip.homeTime);
    expect(trip.burnTime * 2 + trip.coastTime).toBeCloseTo(trip.shipTime, 3);
  });

  it("burns less than it carries when the trip is within reach", () => {
    const small = { dryMass: 25000, fuel: 5000, exhaust: 0.72, acceleration: 0.3 };
    const trip = voyage(0.52 * 1.495978707e11, small);
    expect(trip.coasts).toBe(false);
    expect(trip.fuelBurnt).toBeLessThan(5000);
    expect(trip.fuelBurnt).toBeGreaterThan(0);
  });
});
