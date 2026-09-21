import type { Candidate } from "./NextWordModel";

/** The dice: a number from 0 to 1 walks down the candidates until their chances use it up. */
export function pickWord(candidates: readonly Candidate[], random: () => number): string | null {
  let left = random();
  for (const candidate of candidates) {
    left -= candidate.probability;
    if (left <= 0) return candidate.word;
  }
  return candidates[candidates.length - 1]?.word ?? null;
}
