/**
 * A seed is a whole planet: the same number always grows the same world, so a
 * world can be linked to, tested, and grown again identically in a year.
 */
export function randomOf(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** A hash of a lattice point, which is what value noise is made of. */
export function hashOf(seed: number, x: number, y: number, z: number): number {
  let value = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(z | 0, 0x9e3779b1);
  value = Math.imul(value ^ seed, 0x85ebca6b);
  value ^= value >>> 13;
  value = Math.imul(value, 0xc2b2ae35);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}
