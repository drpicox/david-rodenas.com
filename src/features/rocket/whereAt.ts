import type { Ship } from "./Ship";
import type { Voyage } from "./voyage";

const C = 299792458;
const G = 9.81;

export interface Moment {
  /** How much of the way has been covered, 0 to 1. */
  readonly along: number;
  /** Seconds gone by at home. */
  readonly homeTime: number;
  /** As a share of the speed of light. */
  readonly speed: number;
}

/**
 * The voyage at one moment of the ship's own clock: the burn out, the coast
 * if there is one, and the burn that stops it, which is the first one run
 * backwards from the far end.
 */
export function whereAt(trip: Voyage, ship: Ship, shipTime: number): Moment {
  const a = ship.acceleration * G;
  const burning = (tau: number) => ({
    distance: ((C * C) / a) * (Math.cosh((a * tau) / C) - 1),
    homeTime: (C / a) * Math.sinh((a * tau) / C),
    speed: Math.tanh((a * tau) / C),
  });
  const burn = burning(trip.burnTime);
  const coastHomeTime = trip.homeTime - 2 * burn.homeTime;
  const coastDistance = coastHomeTime * trip.topSpeed * C;
  const whole = 2 * burn.distance + coastDistance;
  const tau = Math.max(0, Math.min(shipTime, trip.shipTime));

  if (tau <= trip.burnTime) {
    const now = burning(tau);
    return { along: now.distance / whole, homeTime: now.homeTime, speed: now.speed };
  }
  if (tau <= trip.burnTime + trip.coastTime) {
    const share = (tau - trip.burnTime) / trip.coastTime;
    return { along: (burn.distance + share * coastDistance) / whole, homeTime: burn.homeTime + share * coastHomeTime, speed: trip.topSpeed };
  }
  const left = burning(trip.shipTime - tau);
  return { along: 1 - left.distance / whole, homeTime: trip.homeTime - left.homeTime, speed: left.speed };
}
