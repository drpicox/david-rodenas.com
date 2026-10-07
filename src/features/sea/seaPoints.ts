import type { SeaPoint } from "./SeaPoint";

/**
 * The cells of a quarter of a degree, some 25 km across, off four stretches
 * of the Catalan coast, north to south: the grid's own, each checked to be
 * sea. Each is the sea off a place, not the water at its beach — the one off
 * Barcelona has its centre some fifteen kilometres out.
 */
export const seaPoints: readonly SeaPoint[] = [
  { code: "estartit", name: "Off L'Estartit", lat: 42.125, lon: 3.375 },
  { code: "barcelona", name: "Off Barcelona", lat: 41.375, lon: 2.375 },
  { code: "tarragona", name: "Off Tarragona", lat: 41.125, lon: 1.375 },
  { code: "ebre", name: "Off the Ebre delta", lat: 40.625, lon: 0.875 },
];
