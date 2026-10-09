import type { Flag } from "./Flag";

/**
 * `?portfolio=on`: a link that switches a trial for whoever follows it; and
 * `?search=palette`, one that chooses for a flag with choices, every other
 * choice off. Only declared flags are read, so no other query is mistaken
 * for one.
 */
export function flagsInAddress(flags: readonly Flag[], search: string): Record<string, boolean> {
  const query = new URLSearchParams(search);
  const asked: Record<string, boolean> = {};
  for (const { name, choices } of flags) {
    const value = query.get(name);
    if (value === null) continue;
    if (!choices) {
      if (value === "on" || value === "off") asked[name] = value === "on";
    } else if (value === "off" || choices.includes(value)) {
      for (const choice of choices) asked[`${name}=${choice}`] = choice === value;
    }
  }
  return asked;
}
