import { acrossFace } from "../acrossFace";
import { radiusOfFace } from "../radiusOfFace";
import type { Filter } from "../World";

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
