import type { RunningYear } from "./RunningYear";

/** A file of years, marked with the one still running when it holds it: the year, and the last day it reaches. */
export type WithSoFar<Held> = Held & { readonly soFar?: { readonly year: number; readonly through: string } };

/**
 * A file of finished years with the running year put among them, and marked,
 * so that whatever draws the years can draw that one as less than a year. A
 * running year already held whole is an old copy, and is left out.
 */
export function withSoFar<Held extends { readonly years: Readonly<Record<string, unknown>> }>(held: Held, running: RunningYear<Held> | null, file: string): WithSoFar<Held> {
  const ofIt = running?.files[file]?.years[running.year];
  if (!running || ofIt === undefined || String(running.year) in held.years) return held;
  return { ...held, years: { ...held.years, [running.year]: ofIt }, soFar: { year: running.year, through: running.through } };
}
