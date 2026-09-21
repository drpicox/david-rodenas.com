const UNITS: readonly (readonly [number, string])[] = [
  [365.25 * 86400 * 1e6, "million years"],
  [365.25 * 86400, "years"],
  [86400, "days"],
  [3600, "hours"],
  [60, "minutes"],
  [1, "seconds"],
];

/** Seconds, in the largest unit that fits, to two figures or so. */
export function saidTime(seconds: number): string {
  const [size, name] = UNITS.find(([unit]) => seconds >= unit) ?? [1, "seconds"];
  const amount = seconds / size;
  const shown = amount >= 10 ? Math.round(amount).toLocaleString("en-US") : String(Math.round(amount * 10) / 10);
  return `${shown} ${name}`;
}
