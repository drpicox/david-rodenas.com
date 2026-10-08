import { answersOf } from "./answersOf";
import { layeredJson } from "./layeredJson";
import { missingYears } from "./missingYears";
import type { RefreshPorts } from "./RefreshPorts";
import type { YearlySource } from "./YearlySource";

export interface RefreshReport {
  readonly added: readonly number[];
  readonly failed?: { readonly year: number; readonly reason: string };
}

/** Deep enough that a file of years has one year to a line. */
const pretty = (value: unknown) => layeredJson(value, 2);

/**
 * Brings a source up to the last finished year, a year at a time, oldest
 * first. A year is written only once all of it has arrived and made sense, so
 * a portal that is down, slow or answering nonsense costs nothing that was
 * already held — and never throws, because a build should not fail over data
 * it already has a copy of. It stops at the first year that fails: a portal
 * that would not answer for one year is not asked thirty more times.
 *
 * `again` names years to ask for even though they are held.
 */
export async function refreshSource<Held>(source: YearlySource<Held>, ports: RefreshPorts, again: readonly number[] = []): Promise<RefreshReport> {
  const at = (file: string) => `${source.directory}/${file}`;
  const parsed = <T>(file: string): T | undefined => {
    const text = ports.read(at(file));
    return text === null ? undefined : (JSON.parse(text) as T);
  };

  let years = parsed<{ years?: number[] }>("index.json")?.years ?? [];
  const wanted = [...new Set([...missingYears(years, source.firstYear, ports.today), ...again])].sort((a, b) => a - b);
  const added: number[] = [];
  const known = new Map<string, Promise<unknown>>();

  for (const year of wanted) {
    try {
      const answers = await answersOf(source, year, ports, known);
      const held = Object.fromEntries(source.files.map((file) => [file, parsed<Held>(file)]));
      const files = source.withYear(held, year, answers);

      years = [...new Set([...years, year])].sort((a, b) => a - b);
      for (const [file, content] of Object.entries(files)) ports.write(at(file), pretty(content));
      ports.write(at("index.json"), pretty({ ...source.about, years, refreshed: ports.today.toISOString().slice(0, 10) }));
      added.push(year);
      ports.log(`${source.name}: ${year} added`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      ports.log(`${source.name}: ${year} failed (${reason}); keeping what is held`);
      return { added, failed: { year, reason } };
    }
  }
  if (wanted.length === 0) ports.log(`${source.name}: up to date`);
  return { added };
}
