import { reachOf } from "./reachOf";

/** What joins two files: an arrow, either way; arrows through other files; or nothing, near or far — the case where changing together says something the source does not. */
export function joinedBy(links: readonly (readonly [number, number])[], a: number, b: number): "arrow" | "through" | "none" {
  const distance = Math.min(reachOf(links, a, Infinity, "needs").get(b) ?? Infinity, reachOf(links, b, Infinity, "needs").get(a) ?? Infinity);
  return distance === 1 ? "arrow" : Number.isFinite(distance) ? "through" : "none";
}
