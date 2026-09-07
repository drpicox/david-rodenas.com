import { subdivide } from "./icosphere";
import { randomOf } from "./randomOf";
import { acrossFace, withMesh, type Filter } from "./World";

/**
 * Split every edge and push the new midpoint along its own radius, by a
 * fraction of the length of the edge it came from.
 *
 * Tying the displacement to the edge length is the whole trick: edges halve at
 * every level, so the first rounds carve continents and the last ones only
 * roughen a slope. `roughness` is the one dial — 0.1 was the default in 1999.
 *
 * The surface type rides along, as in `FractalRadialTexturat`: the corners of
 * the icosahedron get a random one, and each midpoint takes a blend of its
 * two ends nudged by chance and by how different the ends are.
 */
export const fractalise =
  (levels = 4, roughness = 0.28, textureRoughness = 0.2): Filter =>
  (world) => {
    const random = randomOf(world.seed);
    let mesh = world.mesh;
    const surface = Float32Array.from(mesh.surface, () => random());
    mesh = { ...mesh, surface };
    for (let level = 0; level < levels; level += 1) {
      mesh = subdivide(
        mesh,
        (length) => length * roughness * (random() - 0.5),
        (a, b) => {
          const proportion = 0.5 + (random() - 0.5) * (a - b) * textureRoughness;
          return Math.min(1, Math.max(0, a * (1 - proportion) + b * proportion));
        },
      );
    }
    return withMesh(world, mesh);
  };

export interface Climate {
  /** Kelvin at sea level on the equator. */
  readonly equator: number;
  /** Kelvin at the pole. */
  readonly pole: number;
  /** Kelvin at the highest summit, wherever it is. */
  readonly peak: number;
}

/**
 * `PosarTemperatura`, as written: temperature falls in a straight line with
 * the radius, from the equator's number at the lowest point to the peak's at
 * the highest, and a latitude term takes it towards the pole's number. Which
 * is why a summit is cold wherever it stands: height alone gets it there.
 * Run after the sea, the lowest point is sea level, so the equator's number
 * is what the coast gets. The defaults in the source (200, 150, 150) freeze
 * everything; these are numbers that give the worlds in the 1999 pictures.
 */
export const temperatures =
  ({ equator = 300, pole = 240, peak = 240 }: Partial<Climate> = {}): Filter =>
  (world) => {
    const temperature = new Float32Array(world.mesh.vertexCount);
    const radii = world.mesh.radii;
    const lowest = radii.reduce((low, radius) => Math.min(low, radius), Infinity);
    const highest = radii.reduce((high, radius) => Math.max(high, radius), -Infinity);
    const steps = highest - lowest || 1;

    const perStep = (equator - peak) / steps;
    const base = equator + perStep * lowest;
    const perLatitude = (pole - equator) / lowest;
    const perHeight = (peak - base) / highest;

    for (let vertex = 0; vertex < world.mesh.vertexCount; vertex += 1) {
      const radius = radii[vertex] ?? 1;
      const y = Math.abs((world.mesh.directions[vertex * 3 + 1] ?? 0) * radius);
      temperature[vertex] = Math.max(0, Math.floor(base + perLatitude * y + perHeight * radius));
    }

    return { ...world, temperature };
  };

/**
 * The sea is a minimum radius. Every corner below it is pushed up to exactly
 * it, so the ocean comes out as a smooth sphere and the land stands on top of
 * it as relief — which is why a coastline reads as a coastline and not as a
 * change of colour.
 */
export const sea =
  (share = 0.55): Filter =>
  (world) => {
    const sorted = Float32Array.from(world.mesh.radii).sort();
    const index = Math.min(sorted.length - 1, Math.floor(sorted.length * share));
    const seaRadius = sorted[index] ?? 1;

    const radii = Float32Array.from(world.mesh.radii, (radius) => Math.max(radius, seaRadius));
    return { ...world, mesh: { ...world.mesh, radii }, seaRadius };
  };

type Rgb = readonly [number, number, number];

// The palette of `TexturaTemperatura`, name for name.
const GLAC: Rgb = [217, 249, 255];
const PEDRA_FOSCA: Rgb = [47, 47, 28];
const PEDRA_CLARA: Rgb = [177, 160, 143];
const BOSC_FOSC: Rgb = [67, 88, 37];
const BOSC_MIG: Rgb = [79, 172, 51];
const BOSC_CLAR: Rgb = [163, 231, 61];
const BOSC_MARRO: Rgb = [169, 160, 54];
const VERMELL_MART: Rgb = [252, 64, 10];
const MAGMA_FRED: Rgb = [90, 12, 12];
const MAGMA_NORMAL: Rgb = [222, 73, 10];
const MAGMA_CALENT: Rgb = [231, 203, 5];
const BLANC_GROGOS: Rgb = [254, 247, 194];
const BLANC_BLAVOS: Rgb = [194, 254, 231];
const BLANC: Rgb = [255, 255, 255];
const SORRA: Rgb = [218, 190, 80];
const MAR_1: Rgb = [0, 0, 255];
const MAR_2: Rgb = [0, 255, 255];

/** Rows by temperature band, columns by surface type: low, middle, high. */
const COLOURS: readonly (readonly [Rgb, Rgb, Rgb])[] = [
  [GLAC, PEDRA_FOSCA, SORRA], // below 220 K
  [SORRA, GLAC, PEDRA_FOSCA], // 273
  [BOSC_MIG, BOSC_FOSC, PEDRA_FOSCA], // 283
  [BOSC_CLAR, BOSC_MIG, PEDRA_FOSCA], // 293
  [BOSC_MARRO, BOSC_CLAR, SORRA], // 303
  [BOSC_CLAR, BOSC_MARRO, SORRA], // 323
  [PEDRA_FOSCA, SORRA, BOSC_MARRO], // 373
  [SORRA, PEDRA_CLARA, VERMELL_MART], // 473
  [PEDRA_FOSCA, PEDRA_CLARA, SORRA], // 1000
  [MAGMA_NORMAL, MAGMA_FRED, PEDRA_FOSCA], // 2000
  [MAGMA_CALENT, MAGMA_NORMAL, MAGMA_FRED], // 2500
  [MAGMA_NORMAL, MAGMA_CALENT, MAGMA_FRED], // 5000
  [MAGMA_CALENT, BLANC_GROGOS, MAGMA_CALENT], // 5500
  [BLANC_GROGOS, BLANC_BLAVOS, BLANC], // and beyond
];
const BANDS = [220, 273, 283, 293, 303, 323, 373, 473, 1000, 2000, 2500, 5000, 5500];

function rowOf(kelvin: number): number {
  const row = BANDS.findIndex((band) => kelvin < band);
  return row < 0 ? BANDS.length : row;
}

function columnOf(surface: number): 0 | 1 | 2 {
  if (surface < 0.3) return 0;
  if (surface > 0.8) return 2;
  return 1;
}

/** `aleatoritzarColor`: the strongest channel is pushed up by the surface type, the other two down. */
function tinted([r, g, b]: Rgb, surface: number): Rgb {
  const room = (channel: number) => Math.floor((Math.min(channel, 255 - channel) * surface) / 5);
  const strongest = r >= g && r >= b ? 0 : g >= r && g >= b ? 1 : 2;
  const channels = [r, g, b].map((channel, index) => (index === strongest ? channel + room(channel) : channel - room(channel)));
  return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0];
}

/** `Mar.acolorir`: between two colours, by surface type, not by depth. */
function seaColour(surface: number): Rgb {
  return [
    Math.floor(MAR_1[0] * surface + MAR_2[0] * (1 - surface)),
    Math.floor(MAR_1[1] * surface + MAR_2[1] * (1 - surface)),
    Math.floor(MAR_1[2] * surface + MAR_2[2] * (1 - surface)),
  ];
}

/**
 * Paint it, one colour per face and no blending across the edges: the 1999
 * table, by the face's mean temperature and mean surface type, tinted as the
 * original tinted it; and the sea's own two colours where all three corners
 * sit on the water.
 *
 * It runs last because it reads everything the others decided: before the sea
 * exists there is no coastline to find, and before the climate exists there is
 * nowhere to put the ice.
 */
export const colourise: Filter = (world) => {
  const faceColour = new Uint8ClampedArray(world.mesh.faceCount * 3);
  const waterline = world.seaRadius * 1.0000001;

  for (let face = 0; face < world.mesh.faceCount; face += 1) {
    const surface = acrossFace(world, world.mesh.surface, face);
    const a = world.mesh.faces[face * 3] ?? 0;
    const b = world.mesh.faces[face * 3 + 1] ?? 0;
    const c = world.mesh.faces[face * 3 + 2] ?? 0;
    const underWater = [a, b, c].every((corner) => (world.mesh.radii[corner] ?? 1) <= waterline);

    const rgb = underWater
      ? seaColour(surface)
      : tinted(COLOURS[rowOf(Math.floor(acrossFace(world, world.temperature, face)))]?.[columnOf(surface)] ?? BLANC, surface);

    faceColour[face * 3] = rgb[0];
    faceColour[face * 3 + 1] = rgb[1];
    faceColour[face * 3 + 2] = rgb[2];
  }

  return { ...world, faceColour };
};
