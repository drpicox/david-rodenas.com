/**
 * The year to show as still running: this one, or last year while it is not
 * held whole — in January the portals do not have December yet, and a year
 * that vanished for a few weeks would be stranger than one marked so far.
 */
export function runningYearOf(held: readonly number[], today: Date): number {
  const year = today.getUTCFullYear();
  return held.includes(year - 1) ? year : year - 1;
}
