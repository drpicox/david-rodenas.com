import { Pending } from "./Pending";

/**
 * A file that may not be there — the year still running is never committed,
 * so a fresh clone has none — read if it is, waited for while it is on its
 * way, and nothing at all when it is not there.
 */
export function optionalRead(read: (path: string) => string, path: string): string | null {
  try {
    return read(path);
  } catch (error) {
    if (error instanceof Pending) throw error;
    return null;
  }
}
