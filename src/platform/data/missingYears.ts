/**
 * The finished years a source does not hold yet, oldest first. The running
 * year is never one of them, so a source that is up to date asks for nothing
 * until the year changes.
 */
export function missingYears(held: readonly number[], firstYear: number, today: Date): number[] {
  const missing: number[] = [];
  for (let year = firstYear; year < today.getUTCFullYear(); year += 1) {
    if (!held.includes(year)) missing.push(year);
  }
  return missing;
}
