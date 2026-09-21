import { destinations } from "./destinations";
import { saidTime } from "./saidTime";
import type { Ship } from "./Ship";
import { voyage, type Voyage } from "./voyage";

const C = 299792458;
const G = 9.81;
const W = 720;
const H = 170;
const PAD = { top: 12, right: 10, bottom: 24, left: 40 };

/** 0.95 is "95%"; 0.99999 is "99.999%": as many nines as it has, because past 99% the nines are the whole story. */
function saidSpeed(share: number): string {
  if (share < 0.01) return `${Math.round((share * C) / 1000).toLocaleString("en-US")} km/s`;
  if (share < 0.99) return `${(share * 100).toPrecision(2)}% of c`;
  const nines = Math.min(12, Math.ceil(-Math.log10(1 - share)));
  return `${(Math.floor(share * 10 ** nines) / 10 ** (nines - 2)).toFixed(nines - 2)}% of c`;
}

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumSignificantDigits: 3 });

function tonnes(mass: number): string {
  if (mass >= 1e6) return `${compact.format(mass)} t`;
  return `${mass >= 100 ? Math.round(mass).toLocaleString("en-US") : mass.toPrecision(2)} t`;
}

/** Speed against the ship's own clock: the burn bends over towards light, the coast is flat, the stop is the burn backwards. */
function profile(trip: Voyage, ship: Ship): string {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (seconds: number) => PAD.left + (seconds / trip.shipTime) * innerW;
  const y = (share: number) => PAD.top + innerH - (share / Math.max(trip.topSpeed, 1e-12)) * innerH;
  const a = ship.acceleration * G;
  const STEPS = 24;
  const burn = Array.from({ length: STEPS + 1 }, (_, step) => (trip.burnTime * step) / STEPS).map((tau) => [tau, Math.tanh((a * tau) / C)] as const);
  const points = [...burn.map(([tau, v]) => [tau, v] as const), ...burn.reverse().map(([tau, v]) => [trip.shipTime - tau, v] as const)];
  const line = points.map(([tau, v]) => `${x(tau).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const coast = trip.coasts
    ? `<text x="${((x(trip.burnTime) + x(trip.shipTime - trip.burnTime)) / 2).toFixed(1)}" y="${(y(trip.topSpeed) + 14).toFixed(1)}" text-anchor="middle">engine off, ${saidTime(trip.coastTime)}</text>`
    : "";
  return (
    `<svg class="trip" viewBox="0 0 ${W} ${H}" role="img" aria-label="Speed against the ship's clock">` +
    `<line class="grid" x1="${PAD.left}" x2="${W - PAD.right}" y1="${y(0)}" y2="${y(0)}"/>` +
    `<line class="grid" x1="${PAD.left}" x2="${W - PAD.right}" y1="${y(trip.topSpeed)}" y2="${y(trip.topSpeed)}"/>` +
    `<text x="${PAD.left}" y="${y(trip.topSpeed) - 3}">${saidSpeed(trip.topSpeed)}</text>` +
    `<polyline class="line" points="${line}"/>${coast}` +
    `<text x="${PAD.left}" y="${H - 6}">departure</text><text x="${W - PAD.right}" y="${H - 6}" text-anchor="end">arrival, ${saidTime(trip.shipTime)} on board</text>` +
    `</svg>`
  );
}

/**
 * Every destination for one ship, as a table — both clocks side by side — and
 * the chosen trip drawn underneath. A row is a way to choose it.
 */
export function renderVoyages(ship: Ship, chosen: string): string {
  const trips = destinations.map((destination) => ({ destination, trip: voyage(destination.metres, ship) }));
  const rows = trips
    .map(({ destination, trip }) => {
      const classes = [destination.name === chosen ? "chosen" : "", trip.coasts ? "coasts" : ""].filter(Boolean).join(" ");
      const fuel = trip.coasts ? `all ${tonnes(ship.fuel)}, then coasts` : tonnes(trip.fuelBurnt);
      return (
        `<tr${classes ? ` class="${classes}"` : ""} data-destination="${destination.name}"><th scope="row">${destination.name}</th><td>${destination.said}</td>` +
        `<td>${saidTime(trip.shipTime)}</td><td>${saidTime(trip.homeTime)}</td><td>${saidSpeed(trip.topSpeed)}</td><td>${fuel}</td></tr>`
      );
    })
    .join("");
  const picked = trips.find(({ destination }) => destination.name === chosen) ?? trips[0];

  return (
    `<figure class="rocket"><table class="voyages"><thead><tr><th>to</th><th>distance</th><th>on board</th><th>at home</th><th>top speed</th><th>fuel burnt</th></tr></thead><tbody>${rows}</tbody></table>` +
    (picked ? `<h4>To ${picked.destination.name}: speed against the ship's clock</h4>${profile(picked.trip, ship)}` : "") +
    `</figure>`
  );
}
