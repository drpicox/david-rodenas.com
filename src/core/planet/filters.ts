import { fractalNoiseAt } from "./noiseAt";
import { randomOf } from "./randomOf";
import { directionOf, latitudeOf, type Filter } from "./World";

/**
 * Raise the land. Two noise fields, not one: the second decides how rough the
 * first is allowed to be, which is what keeps a planet from looking like the
 * same hill repeated everywhere.
 */
export const fractalise: Filter = (world) => {
  const elevation = new Float32Array(world.elevation.length);
  const random = randomOf(world.seed);
  const continents = { octaves: 4, frequency: 1.1 + random() * 0.9, gain: 0.5 };
  const roughness = { octaves: 5, frequency: 3.5 + random() * 3, gain: 0.55 };

  for (let y = 0; y < world.height; y += 1) {
    for (let x = 0; x < world.width; x += 1) {
      const [dx, dy, dz] = directionOf(world, x, y);
      const base = fractalNoiseAt(world.seed, dx, dy, dz, continents) * 2 - 1;
      const detail = fractalNoiseAt(world.seed + 977, dx, dy, dz, roughness) * 2 - 1;
      elevation[y * world.width + x] = base + detail * 0.35 * (0.4 + Math.abs(base));
    }
  }

  return { ...world, elevation };
};

/**
 * Warm at the equator, cold at the poles, and colder the higher you stand.
 * A little noise so the belts are not perfect rings.
 */
export const temperatures: Filter = (world) => {
  const temperature = new Float32Array(world.temperature.length);
  const random = randomOf(world.seed ^ 0x5f3a);
  // Some worlds run hot and some run cold. It is one number, and it is the
  // difference between six planets and six versions of the same planet.
  const climate = 0.9 + random() * 0.35;

  for (let y = 0; y < world.height; y += 1) {
    const fromEquator = latitudeOf(world, y);
    for (let x = 0; x < world.width; x += 1) {
      const index = y * world.width + x;
      const [dx, dy, dz] = directionOf(world, x, y);
      const weather = fractalNoiseAt(world.seed + 31, dx, dy, dz, { octaves: 3, frequency: 2.4, gain: 0.5 });
      const height = Math.max(0, world.elevation[index] ?? 0);
      temperature[index] = climate - fromEquator ** 1.5 - height * 0.5 + (weather - 0.5) * 0.3;
    }
  }

  return { ...world, temperature };
};

/**
 * Choose where the water stops. Taking a share of the surface rather than a
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

/**
 * Warm and low is desert, temperate is green, cold is taiga and then ice.
 * The desert belt is deliberately narrow: a world that is ochre from pole to
 * pole says nothing, and the point of a generated world is that it says
 * something different every time.
 */
function groundAt(warmth: number): Rgb {
  if (warmth > 0.78) return DESERT;
  if (warmth > 0.66) return mix(GRASS, DESERT, (warmth - 0.66) / 0.12);
  if (warmth > 0.34) return GRASS;
  return mix(TAIGA, GRASS, (warmth - 0.16) * 4);
}

/**
 * Paint it. This filter reads the sea level and the temperature, so running it
 * before either of them leaves a world one flat colour — which is the whole
 * point of the pipeline having an order.
 */
export const colourise: Filter = (world) => {
  const colour = new Uint8ClampedArray(world.colour.length);
  const relief = 1.5;

  for (let index = 0; index < world.elevation.length; index += 1) {
    const height = (world.elevation[index] ?? 0) - world.seaLevel;
    const warmth = world.temperature[index] ?? 0;

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

    colour[index * 3] = rgb[0];
    colour[index * 3 + 1] = rgb[1];
    colour[index * 3 + 2] = rgb[2];
  }

  return { ...world, colour };
};
