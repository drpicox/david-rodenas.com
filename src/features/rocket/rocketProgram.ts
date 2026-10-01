import type { Program } from "../../platform/program/Program";
import { destinations } from "./destinations";
import { firstShip } from "./firstShip";
import { renderVoyages } from "./renderVoyages";
import { saidSpeed } from "./saidSpeed";
import { saidTime } from "./saidTime";
import { saidTonnes } from "./saidTonnes";
import { shipOf } from "./shipOf";
import { voyage } from "./voyage";

const YEAR = 365.25 * 86400;
const LIGHT_YEAR = 9.4607e15;
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumSignificantDigits: 2 });

/**
 * The ship as three quantities and a destination. The fuel is said as a
 * multiple of the ship, the one way to say it that makes sense from the Moon
 * to Andromeda; the exhaust as a percentage of light.
 */
export const rocketProgram: Program = {
  name: "rocket",
  summary: "a relativistic rocket: how long a trip takes on board and at home, and what it burns",
  parameters: [
    { name: "acceleration", label: "Acceleration", description: "what the crew feels while the engine burns, in g", min: 0.05, max: 3, step: 0.05, initial: 0.3, show: (v) => `${v.toFixed(2)} g` },
    // From a tenth of the ship to what Andromeda takes, ten million million ships of fuel: only a logarithm slides that far.
    { name: "fuel", label: "Fuel", description: "fuel on board, as a multiple of the ship's own mass", min: 0.1, max: 1e13, step: 0.05, initial: firstShip.fuel / firstShip.dryMass, scale: "log", show: (v) => `${compact.format(v)} × the ship` },
    { name: "exhaust", label: "Exhaust speed", description: "the speed of what leaves the engine, in percent of the speed of light", min: 1, max: 100, step: 1, initial: firstShip.exhaust * 100, show: (v) => `${Math.round(v)}% of c` },
    { name: "to", label: "To", description: "where to fly", choices: destinations.map((destination) => destination.name), initial: "Proxima Centauri" },
  ],
  run(values) {
    const ship = shipOf(values);
    const chosen = String(values["to"]);
    const destination = destinations.find(({ name }) => name === chosen) ?? destinations[0]!;
    const trip = voyage(destination.metres, ship);
    const fuel = trip.coasts ? `all ${saidTonnes(ship.fuel)} of fuel, then coasts` : `${saidTonnes(trip.fuelBurnt)} of fuel`;

    return {
      text: `to ${destination.name}, ${destination.said}: ${saidTime(trip.shipTime)} on board, ${saidTime(trip.homeTime)} at home, top speed ${saidSpeed(trip.topSpeed)}, ${fuel}`,
      html: renderVoyages(ship, chosen),
      // The trip asked for, and not the other ten the page's table shows: an agent asks again for another.
      data: {
        ship: { dryMassTonnes: ship.dryMass, fuelTonnes: ship.fuel, exhaustFractionOfC: ship.exhaust, accelerationG: ship.acceleration },
        trip: {
          to: destination.name,
          distance: destination.said,
          distanceLightYears: destination.metres / LIGHT_YEAR,
          onBoardYears: trip.shipTime / YEAR,
          atHomeYears: trip.homeTime / YEAR,
          topSpeedFractionOfC: trip.topSpeed,
          fuelBurntTonnes: trip.fuelBurnt,
          coasts: trip.coasts,
        },
      },
    };
  },
};
