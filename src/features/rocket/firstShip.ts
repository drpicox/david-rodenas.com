import type { Ship } from "./Ship";

/** The ship the simulator opens with: a fusion torch that crosses the solar system in days and cannot reach a star in a lifetime. */
export const firstShip: Ship = { dryMass: 25000, fuel: 5000, exhaust: 0.72, acceleration: 0.3 };
