import type { Ship } from "./Ship";

const C = 299792458;
const G = 9.81;

export interface Voyage {
  /** Seconds on the ship's clock. */
  readonly shipTime: number;
  /** Seconds on the clocks left at home. */
  readonly homeTime: number;
  /** Seconds of ship time each burn lasts: one to speed up, one the same to stop. */
  readonly burnTime: number;
  /** Seconds of ship time spent with the engine off, in between. */
  readonly coastTime: number;
  /** The fastest it goes, as a share of the speed of light. */
  readonly topSpeed: number;
  /** Tonnes. */
  readonly fuelBurnt: number;
  /** There was not enough fuel to burn all the way, so part of the trip is coasted. */
  readonly coasts: boolean;
}

/**
 * The relativistic rocket, as the Usenet Physics FAQ works it out: a ship
 * that holds a steady acceleration by its own reckoning, speeds up to halfway
 * and slows down the rest. When the fuel will not last, it burns half of
 * what it has, coasts, and keeps the other half to stop.
 *
 * Mass follows the rocket equation with the exhaust at `exhaust`·c:
 * m = m₀·exp(−aτ / (exhaust·c)).
 */
export function voyage(metres: number, ship: Ship): Voyage {
  const a = ship.acceleration * G;
  const launchMass = ship.dryMass + ship.fuel;
  const exhaust = ship.exhaust * C;

  const halfway = (C / a) * Math.acosh(1 + (a * metres) / (2 * C * C));
  const needed = launchMass * (1 - Math.exp((-2 * a * halfway) / exhaust));
  const coasts = needed > ship.fuel;

  // With fuel to spare the burn lasts to halfway; without, until half the fuel is gone.
  const burnTime = coasts ? (exhaust / a) * Math.log(launchMass / (launchMass - ship.fuel / 2)) : halfway;
  const topSpeed = Math.tanh((a * burnTime) / C);
  const burnHomeTime = (C / a) * Math.sinh((a * burnTime) / C);
  const burnDistance = ((C * C) / a) * (Math.cosh((a * burnTime) / C) - 1);

  const coastDistance = Math.max(0, metres - 2 * burnDistance);
  const coastHomeTime = coasts ? coastDistance / (topSpeed * C) : 0;
  const coastTime = coastHomeTime * Math.sqrt(1 - topSpeed * topSpeed);

  return {
    shipTime: 2 * burnTime + coastTime,
    homeTime: 2 * burnHomeTime + coastHomeTime,
    burnTime,
    coastTime,
    topSpeed,
    fuelBurnt: coasts ? ship.fuel : needed,
    coasts,
  };
}
