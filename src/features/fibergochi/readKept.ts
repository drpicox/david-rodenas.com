import type { FibergochiState } from "./FibergochiState";

const NUMBERS = ["step", "hour", "day", "term", "boredom", "sleep", "terminal", "enrolled", "passed", "left", "suggested"] as const;
const DOING = ["idle", "asleep", "studying", "browsing", "looking", "lab"];

const numbers = (value: unknown, length: number) => Array.isArray(value) && value.length === length && value.every((n) => Number.isFinite(n));

/**
 * The Fibergochi this browser kept, or none. What comes back from storage was
 * written by an older version of this page, or by hand, so every field is
 * checked, and anything that is not a Fibergochi starts a new one.
 */
export function readKept(text: string | null): FibergochiState | null {
  let kept: Record<string, unknown>;
  try {
    kept = JSON.parse(text ?? "null");
  } catch {
    return null;
  }
  if (typeof kept !== "object" || kept === null || Array.isArray(kept)) return null;
  const fits =
    NUMBERS.every((name) => Number.isFinite(kept[name])) &&
    DOING.includes(kept["doing"] as string) &&
    numbers(kept["exams"], 10) &&
    numbers(kept["labs"], 10) &&
    numbers(kept["alfas"], 6) &&
    typeof kept["selection"] === "boolean" &&
    [null, "enrol", "degree"].includes(kept["asks"] as string) &&
    [null, "good", "bad"].includes(kept["ended"] as string) &&
    Array.isArray(kept["said"]) &&
    kept["said"].every((line) => typeof line === "string");
  return fits ? (kept as unknown as FibergochiState) : null;
}
