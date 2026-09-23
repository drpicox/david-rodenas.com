import type { Lot } from "./Lot";

/** What comes off the boats at a Catalan fish market, and roughly what a box resells for, in credits. */
const KINDS: readonly (readonly [string, number])[] = [
  ["sardines", 30],
  ["anchovies", 40],
  ["squid", 90],
  ["hake", 120],
  ["sole", 180],
  ["prawns", 250],
  ["monkfish", 300],
  ["tuna", 400],
];

/** The morning's catch: a mix of kinds, each box worth somewhat more or less than its kind usually does. */
export function randomLots(count: number, random: () => number): Lot[] {
  return Array.from({ length: count }, (_, id) => {
    const [kind, usual] = KINDS[Math.floor(random() * KINDS.length)]!;
    return { id: id + 1, kind, value: Math.round(usual * (0.7 + 0.6 * random())) };
  });
}
