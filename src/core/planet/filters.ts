import { fractalNoiseAt } from "./noiseAt";
import { randomOf } from "./randomOf";
import { acrossFace, latitudeOfVertex, vertexAt, type Filter } from "./World";

/**
 * Raise the land, corner by corner. Two noise fields, not one: the second
 * decides how rough the first is allowed to be, which is what keeps a planet
 * from looking like the same hill repeated everywhere.
 */
export const fractalise: Filter = (world) => {
  const elevation = new Float32Array(world.elevation.length);
  const random = randomOf(world.seed);
  const continents = { octaves: 4, frequency: 1.1 + random() * 0.9, gain: 0.5 };
  const roughness = { octaves: 5, frequency: 3.5 + random() * 3, gain: 0.55 };

  for (let vertex = 0; vertex < world.mesh.vertexCount; vertex += 1) {
    const [x, y, z] = vertexAt(world, vertex);
    const base = fractalNoiseAt(world.seed, x, y, z, continents) * 2 - 1;
    const detail = fractalNoiseAt(world.seed + 977, x, y, z, roughness) * 2 - 1;
    elevation[vertex] = base + detail * 0.35 * (0.4 + Math.abs(base));
  }

  return { ...world, elevation };
};

/**
 * Warm at the equator, cold at the poles, and colder the higher you stand.
 * Some worlds run hot and some run cold: it is one number, and it is the
 * difference between six planets and six versions of the same planet.
 */
export const temperatures: Filter = (world) => {
  const temperature = new Float32Array(world.temperature.length);
  const random = randomOf(world.seed ^ 0x5f3a);
  const climate = 0.9 + random() * 0.35;

  for (let vertex = 0; vertex < world.mesh.vertexCount; vertex += 1) {
    const [x, y, z] = vertexAt(world, vertex);
    const weather = fractalNoiseAt(world.seed + 31, x, y, z, { octaves: 3, frequency: 2.4, gain: 0.5 });
    const height = Math.max(0, world.elevation[vertex] ?? 0);
    temperature[vertex] = climate - latitudeOfVertex(world, vertex) ** 1.5 - height * 0.5 + (weather - 0.5) * 0.3;
  }

  return { ...world, temperature };
};

/**
 * Choose where the water stops. Taking a share of the corners rather than a
 * fixed height means a mountainous world does not come out entirely dry.
 */
export const sea =
  (share = 0.55): Filter =>
  (world) => {
    const sorted = Float32Array.from(world.elevation).sort();
    const index = Math.min(sorted.length - 1, Math.floor(sorted.length * share));
    return { ...world, seaLevel: sorted[index] ?? 0 };
  };

const ABYSS = [8, 40, 96] as const;
const OCEAN = [22, 96, 168] as const;
const SHALLOW = [56, 176, 206] as const;
const SAND = [214, 196, 138] as const;
const DESERT = [190, 158, 84] as const;
const GRASS = [66, 134, 64] as const;
const TAIGA = [72, 104, 74] as const;
const ROCK = [132, 124, 112] as const;
const ICE = [236, 241, 245] as const;

type Rgb = readonly [number, number, number];

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  const amount = Math.min(1, Math.max(0, t));
  return [a[0] + (b[0] - a[0]) * amount, a[1] + (b[1] - a[1]) * amount, a[2] + (b[2] - a[2]) * amount];
}

/** Warm and low is desert, temperate is green, cold is taiga and then ice. */
function groundAt(warmth: number): Rgb {
  if (warmth > 0.78) return DESERT;
  if (warmth > 0.66) return mix(GRASS, DESERT, (warmth - 0.66) / 0.12);
  if (warmth > 0.34) return GRASS;
  return mix(TAIGA, GRASS, (warmth - 0.16) * 4);
}

/**
 * Paint it, one colour per face and no blending across the edges. That flat
 * fill is what makes the triangles of the solid visible in the finished
 * planet, and it is also why this filter has to run last: it reads the sea
 * level and the temperature, so before either of them exists it can only
 * paint one flat colour over everything.
 */
export const colourise: Filter = (world) => {
  const faceColour = new Uint8ClampedArray(world.faceColour.length);
  const relief = 1.5;

  for (let face = 0; face < world.mesh.faceCount; face += 1) {
    const height = acrossFace(world, world.elevation, face) - world.seaLevel;
    const warmth = acrossFace(world, world.temperature, face);

    let rgb: Rgb;
    if (height <= 0) {
      const depth = Math.min(1, -height * 2.6);
      rgb = mix(SHALLOW, mix(OCEAN, ABYSS, depth), Math.min(1, depth * 2.2));
      if (warmth < 0.1) rgb = mix(rgb, ICE, (0.1 - warmth) * 8);
    } else {
      const land = Math.min(1, height * relief);
      rgb = mix(SAND, groundAt(warmth), Math.min(1, land * 7));
      rgb = mix(rgb, ROCK, Math.max(0, land - 0.5) * 2.4);
      if (warmth < 0.2) rgb = mix(rgb, ICE, (0.2 - warmth) * 5);
    }

    faceColour[face * 3] = rgb[0];
    faceColour[face * 3 + 1] = rgb[1];
    faceColour[face * 3 + 2] = rgb[2];
  }

  return { ...world, faceColour };
};
