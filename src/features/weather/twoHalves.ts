export interface Half {
  readonly from: number;
  readonly to: number;
  readonly years: number;
  /** Mean days a year. */
  readonly days: number;
  /** Mean of the yearly figures, or null when no year had one. */
  readonly summary: number | null;
}

interface Counted {
  readonly year: number;
  readonly days: number;
  readonly whole: boolean;
  readonly summary: number | null;
}

const mean = (values: readonly number[]) => values.reduce((a, b) => a + b, 0) / values.length;

function half(years: readonly Counted[]): Half {
  const summaries = years.flatMap(({ summary }) => (summary === null ? [] : [summary]));
  return {
    from: years[0]?.year ?? 0,
    to: years[years.length - 1]?.year ?? 0,
    years: years.length,
    days: mean(years.map(({ days }) => days)),
    summary: summaries.length ? mean(summaries) : null,
  };
}

/**
 * The plainest question to put to a series: is its second half different
 * from its first? Only whole years count, and with fewer than four of them
 * there is nothing to compare. It describes what the record did; it does not
 * predict, and it does not say why.
 */
export function twoHalves(years: readonly Counted[]): readonly [Half, Half] | null {
  const whole = years.filter((year) => year.whole);
  if (whole.length < 4) return null;
  const cut = Math.floor(whole.length / 2);
  return [half(whole.slice(0, cut)), half(whole.slice(cut))];
}
