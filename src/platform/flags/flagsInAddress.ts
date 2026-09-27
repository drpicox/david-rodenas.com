import type { Flag } from "./Flag";

/** `?portfolio=on`: a link that switches a trial for whoever follows it. Only declared flags are read, so no other query is mistaken for one. */
export function flagsInAddress(flags: readonly Flag[], search: string): Record<string, boolean> {
  const query = new URLSearchParams(search);
  const asked: Record<string, boolean> = {};
  for (const { name } of flags) {
    const value = query.get(name);
    if (value === "on" || value === "off") asked[name] = value === "on";
  }
  return asked;
}
