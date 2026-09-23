/**
 * A seed is a whole planet, or a whole auction: the same number always gives
 * the same run, so a world can be linked to, tested, and grown again
 * identically in a year, and a still can be drawn at build time from the
 * same dice the browser will throw.
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
