const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumSignificantDigits: 3 });

/** A mass in tonnes, the way a person would read it off a table. */
export function saidTonnes(mass: number): string {
  if (mass >= 1e6) return `${compact.format(mass)} t`;
  return `${mass >= 100 ? Math.round(mass).toLocaleString("en-US") : mass.toPrecision(2)} t`;
}
