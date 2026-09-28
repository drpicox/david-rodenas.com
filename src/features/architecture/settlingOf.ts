import type { Life } from "./Life";

/** Files at one span of ages, counted together: how many commits they lived through at those ages, and how many of those changed them. */
export interface Settling {
  /** The youngest age in the band, in commits since the file was written. */
  readonly from: number;
  /** The oldest, counted too. */
  readonly to: number;
  readonly lived: number;
  readonly changed: number;
}

/**
 * Whether a file settles: the share of the commits that changed a file, at
 * each age it reached. Ages are counted in commits since the one that wrote
 * it, and gathered in bands that double — one, two, three to four, five to
 * eight — because what happens right after a file is written is what the
 * question is about, and the long tail says the same thing a band at a time.
 */
export function settlingOf(lives: readonly Life[], commits: number): Settling[] {
  const lastAge = (life: Life) => (life.went ?? commits) - 1 - life.born;
  const oldest = Math.max(0, ...lives.map(lastAge));
  const bands: Settling[] = [];
  for (let from = 1, to = 1; from <= oldest; from = to + 1, to *= 2) {
    const top = Math.min(to, oldest);
    const lived = lives.reduce((sum, life) => sum + Math.max(0, Math.min(top, lastAge(life)) - from + 1), 0);
    const changed = lives.reduce((sum, life) => sum + life.changed.filter((at) => at - life.born >= from && at - life.born <= top).length, 0);
    bands.push({ from, to: top, lived, changed });
  }
  return bands;
}
