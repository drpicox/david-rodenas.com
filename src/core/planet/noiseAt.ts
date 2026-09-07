import { hashOf } from "./randomOf";

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Value noise in three dimensions. Two dimensions would be cheaper, but a
 * sphere sampled on a flat map has a seam down one side and a knot at each
 * pole; sampled in space it has neither.
 */
export function noiseAt(seed: number, x: number, y: number, z: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const tx = smooth(x - xi);
  const ty = smooth(y - yi);
  const tz = smooth(z - zi);

  const corner = (dx: number, dy: number, dz: number) => hashOf(seed, xi + dx, yi + dy, zi + dz);

  const y0 = lerp(lerp(corner(0, 0, 0), corner(1, 0, 0), tx), lerp(corner(0, 1, 0), corner(1, 1, 0), tx), ty);
  const y1 = lerp(lerp(corner(0, 0, 1), corner(1, 0, 1), tx), lerp(corner(0, 1, 1), corner(1, 1, 1), tx), ty);
  return lerp(y0, y1, tz);
}

export interface FractalOptions {
  readonly octaves: number;
  readonly frequency: number;
  readonly gain: number;
}

/** Octaves of the same noise, each one finer and quieter than the last. */
export function fractalNoiseAt(
  seed: number,
  x: number,
  y: number,
  z: number,
  { octaves, frequency, gain }: FractalOptions,
): number {
  let amplitude = 1;
  let scale = frequency;
  let total = 0;
  let normalisation = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    total += amplitude * noiseAt(seed + octave * 8191, x * scale, y * scale, z * scale);
    normalisation += amplitude;
    amplitude *= gain;
    scale *= 2;
  }

  return total / normalisation;
}
