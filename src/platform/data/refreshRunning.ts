import { answersOf } from "./answersOf";
import { layeredJson } from "./layeredJson";
import type { RefreshPorts } from "./RefreshPorts";
import type { RunningYear } from "./RunningYear";
import { runningYearOf } from "./runningYearOf";
import type { YearlySource } from "./YearlySource";

const FILE = "running.json";

/**
 * Brings the year still running up to date, at most once a day, into a file
 * of its own beside the finished years. Like the finished years, it never
 * throws and never loses what it held: a portal that fails leaves yesterday's
 * copy, which still says the day it reaches.
 */
export async function refreshRunning<Held>(source: YearlySource<Held>, ports: RefreshPorts): Promise<void> {
  if (!source.soFar) return;
  const at = (file: string) => `${source.directory}/${file}`;
  const parsed = <T>(file: string): T | undefined => {
    const text = ports.read(at(file));
    return text === null ? undefined : (JSON.parse(text) as T);
  };

  const today = ports.today.toISOString().slice(0, 10);
  const year = runningYearOf(parsed<{ years?: number[] }>("index.json")?.years ?? [], ports.today);
  const held = parsed<RunningYear<Held>>(FILE);
  if (held?.year === year && held.refreshed === today) {
    ports.log(`${source.name}: ${year} so far is up to date`);
    return;
  }

  try {
    const { files, through } = source.soFar(year, await answersOf(source, year, ports));
    const running: RunningYear<Held> = { year, through, refreshed: today, files };
    ports.write(at(FILE), layeredJson(running, 3));
    ports.log(`${source.name}: ${year} so far, to ${through}`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    ports.log(`${source.name}: ${year} so far failed (${reason}); keeping what is held`);
  }
}
