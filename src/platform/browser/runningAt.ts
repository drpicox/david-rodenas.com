import { readRunning } from "../data/readRunning";
import type { RunningYear } from "../data/RunningYear";

/**
 * The year still running, asked of the server, or nothing: it is never
 * committed, so a copy built without it has none, and a server that has no
 * file answers with a page of its own — the finished years stand without it.
 */
export async function runningAt<Held>(path: string): Promise<RunningYear<Held> | null> {
  try {
    const response = await fetch(path);
    const text = response.ok ? await response.text() : "";
    return readRunning<Held>(() => text, path);
  } catch {
    return null;
  }
}
