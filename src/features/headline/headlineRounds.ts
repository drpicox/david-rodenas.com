import { shuffled } from "./shuffled";

/**
 * What the headline says next: the lines in rounds. A round is every line
 * once, in an order drawn by lot; the first round opens on the line the page
 * opened with, so it is not typed again straight away; and no round begins
 * with the line the last one ended on. So the first headline is heard as
 * often as any other, and no more.
 */
export function headlineRounds<T>(lines: readonly T[], random: () => number): (current: T) => T {
  let round: T[] = [];
  return (current) => {
    if (round.length === 0) {
      round = shuffled(lines, random);
      if (round.length > 1 && round[0] === current) round.push(round.shift() as T);
    }
    return round.shift() ?? current;
  };
}
