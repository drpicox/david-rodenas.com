import type { RunningYear } from "./RunningYear";

/**
 * The year still running, read where it may not be: it is never committed,
 * so a build without the network, or a fresh clone, has none — and the
 * finished years stand on their own without it.
 */
export function readRunning<Held>(read: (path: string) => string, path: string): RunningYear<Held> | null {
  try {
    const running = JSON.parse(read(path)) as RunningYear<Held>;
    return typeof running?.year === "number" && typeof running.through === "string" ? running : null;
  } catch {
    return null;
  }
}
