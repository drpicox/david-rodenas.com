import type { FlagStore } from "../flags/FlagStore";

/** The same key the head script reads before paint, so a flag that is on is on from the first frame. */
const KEY = "flags";

/**
 * The reader's flags, in a browser: the names that are on, kept in storage as
 * one line, and written on the root element as `data-flags`, which is what a
 * stylesheet rule for a trial looks for: `[data-flags~="portfolio"]`.
 */
export class BrowserFlags implements FlagStore {
  private readonly on: Set<string>;

  constructor() {
    let kept = document.documentElement.dataset["flags"] ?? "";
    try {
      kept = localStorage.getItem(KEY) ?? "";
    } catch {
      // Without storage the root element is all there is to go on.
    }
    this.on = new Set(kept.split(" ").filter(Boolean));
  }

  isOn(name: string): boolean {
    return this.on.has(name);
  }

  set(name: string, on: boolean): void {
    if (on) this.on.add(name);
    else this.on.delete(name);
    const line = [...this.on].join(" ");
    try {
      if (line) localStorage.setItem(KEY, line);
      else localStorage.removeItem(KEY);
    } catch {
      // Without storage the flag still holds until the page is left.
    }
    if (line) document.documentElement.dataset["flags"] = line;
    else delete document.documentElement.dataset["flags"];
  }
}
