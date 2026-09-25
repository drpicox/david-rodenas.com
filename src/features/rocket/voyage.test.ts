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

  it("shares out what fuel it has so that the burn that stops it takes the last of it: both burns change its mass by the same ratio", () => {
    const small = { dryMass: 25000, fuel: 5000, exhaust: 0.72, acceleration: 0.3 };
    const trip = voyage(4.24 * LIGHT_YEAR, small);
    const ratio = Math.exp((0.3 * 9.81 * trip.burnTime) / (0.72 * 299792458));
    expect(30000 / ratio / ratio).toBeCloseTo(25000, 6);
  });

  it("never takes longer for more fuel, and does not jump where it stops having to coast", () => {
    const toProxima = (ships: number, exhaust: number) =>
      voyage(4.24 * LIGHT_YEAR, { dryMass: 25000, fuel: 25000 * ships, exhaust, acceleration: 0.3 }).shipTime / YEAR;
    for (const exhaust of [0.1, 0.72, 1]) {
      const times = [0.1, 0.5, 1, 2, 5, 10, 19, 19.9, 20, 20.1, 30, 1000].map((ships) => toProxima(ships, exhaust));
      times.slice(1).forEach((time, at) => expect(time).toBeLessThanOrEqual(times[at]! + 1e-9));
    }
    // Where it stops coasting: the least fuel that lasts the whole way, found by halving.
    let [low, high] = [1, 1000];
    const coasts = (ships: number) => voyage(4.24 * LIGHT_YEAR, { dryMass: 25000, fuel: 25000 * ships, exhaust: 0.72, acceleration: 0.3 }).coasts;
    for (let n = 0; n < 60; n += 1) [low, high] = coasts((low + high) / 2) ? [(low + high) / 2, high] : [low, (low + high) / 2];
    expect(toProxima(low * 0.999, 0.72) / toProxima(high * 1.001, 0.72)).toBeCloseTo(1, 2);
  });

  it("goes faster with a faster exhaust on the same fuel, while it has to coast", () => {
    const top = (exhaust: number) => voyage(4.24 * LIGHT_YEAR, { dryMass: 25000, fuel: 125000, exhaust, acceleration: 0.3 }).topSpeed;
    expect(top(0.1)).toBeLessThan(top(0.3));
    expect(top(0.3)).toBeLessThan(top(0.72));
  });

  it("burns less than it carries when the trip is within reach", () => {
    const small = { dryMass: 25000, fuel: 5000, exhaust: 0.72, acceleration: 0.3 };
    const trip = voyage(0.52 * 1.495978707e11, small);
    expect(trip.coasts).toBe(false);
    expect(trip.fuelBurnt).toBeLessThan(5000);
    expect(trip.fuelBurnt).toBeGreaterThan(0);
  });
});
