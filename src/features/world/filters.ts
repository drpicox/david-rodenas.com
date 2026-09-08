import { subdivide } from "./icosphere";
import { randomOf } from "./randomOf";
import { acrossFace, latitudeOfVertex, radiusOfFace, withMesh, type Filter } from "./World";

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
  /** Warmth at sea level on the equator. */
  readonly equator: number;
  /** Warmth at the pole, at sea level. */
  readonly pole: number;
  /** Warmth at the highest summit, wherever it stands. */
  readonly peak: number;
}

/**
 * Warmth from latitude and from height above the sea, between three fixed
 * points — the equator, the pole and the summit — which is how the 1999
 * `PosarTemperatura` asked for it. Height is a straight line to the summit's
 * number, and the summit's number is below freezing: that is what puts snow
 * on the Himalaya and on the Teide, neither of them anywhere near a pole.
 * Run after the sea, so the lowest point is sea level.
 */
export const temperatures =
  ({ equator = 1, pole = 0.05, peak = 0 }: Partial<Climate> = {}): Filter =>
  (world) => {
    const temperature = new Float32Array(world.mesh.vertexCount);
    const radii = world.mesh.radii;
    const lowest = radii.reduce((low, radius) => Math.min(low, radius), Infinity);
    const highest = radii.reduce((high, radius) => Math.max(high, radius), -Infinity);
    const span = highest - lowest || 1;

    for (let vertex = 0; vertex < world.mesh.vertexCount; vertex += 1) {
      const height = ((radii[vertex] ?? 1) - lowest) / span;
      const fromEquator = latitudeOfVertex(world, vertex) ** 2.2;
      temperature[vertex] = equator + (pole - equator) * fromEquator + (peak - equator) * height;
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

const OCEAN = [24, 92, 168] as const;
const SHALLOW = [62, 176, 206] as const;
const SAND = [214, 196, 138] as const;
const DESERT = [190, 158, 84] as const;
const GRASS = [70, 138, 66] as const;
const TAIGA = [74, 104, 76] as const;
const ROCK = [136, 128, 116] as const;
const ICE = [238, 243, 247] as const;

type Rgb = readonly [number, number, number];

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  const amount = Math.min(1, Math.max(0, t));
  return [a[0] + (b[0] - a[0]) * amount, a[1] + (b[1] - a[1]) * amount, a[2] + (b[2] - a[2]) * amount];
}

/** Warm and low is desert, temperate is green, cold is taiga and then ice. */
function groundAt(warmth: number): Rgb {
  if (warmth > 0.78) return DESERT;
  if (warmth > 0.62) return mix(GRASS, DESERT, (warmth - 0.62) / 0.16);
  if (warmth > 0.3) return GRASS;
  return mix(TAIGA, GRASS, (warmth - 0.12) * 5.5);
}

/**
 * Paint it, one colour per face and no blending across the edges.
 *
 * It runs last because it reads everything the others decided: before the sea
 * exists there is no coastline to find, and before the climate exists there is
 * nowhere to put the ice.
 */
export const colourise: Filter = (world) => {
  const faceColour = new Uint8ClampedArray(world.mesh.faceCount * 3);
  const highest = world.mesh.radii.reduce((high, radius) => Math.max(high, radius), -Infinity);
  const relief = Math.max(1e-6, highest - world.seaRadius);

  for (let face = 0; face < world.mesh.faceCount; face += 1) {
    const above = (radiusOfFace(world, face) - world.seaRadius) / relief;
    const warmth = acrossFace(world, world.temperature, face);

    let rgb: Rgb;
    if (above <= 0.002) {
      rgb = mix(SHALLOW, OCEAN, 0.55);
      if (warmth < 0.16) rgb = mix(rgb, ICE, (0.16 - warmth) * 6);
    } else {
      rgb = mix(SAND, groundAt(warmth), Math.min(1, above * 9));
      rgb = mix(rgb, ROCK, Math.max(0, above - 0.55) * 2.2);
      if (warmth < 0.26) rgb = mix(rgb, ICE, (0.26 - warmth) * 4);
    }

    faceColour[face * 3] = rgb[0];
    faceColour[face * 3 + 1] = rgb[1];
    faceColour[face * 3 + 2] = rgb[2];
  }

  return { ...world, faceColour };
};
