import type { FlagStore } from "../FlagStore";

/** The same key the head script reads before paint, so a flag that is on is on from the first frame. */
const ON = "flags";
const CHOSEN = "flags-chosen";
const DRAWN = "flags-drawn";

function read(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function write(key: string, value: string): void {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    // Without storage the flags still hold until the page is left.
  }
}

/**
 * The reader's flags, in a browser: the names that are on, kept as one line
 * and written on the root element as `data-flags`, which is what a stylesheet
 * rule for a trial looks for: `[data-flags~="portfolio"]`. Beside them, the
 * flags the reader chose, and what the lot said for the ones in a trial. None
 * of it is about the reader: it is which site they see, kept so that it is
 * the same one every time and does not change under them on a reload.
 */
export class BrowserFlags implements FlagStore {
  private readonly on: Set<string>;
  private readonly picked: Set<string>;
  private readonly lots: Record<string, boolean>;

  constructor() {
    this.on = new Set((read(ON) || document.documentElement.dataset["flags"] || "").split(" ").filter(Boolean));
    this.picked = new Set(read(CHOSEN).split(" ").filter(Boolean));
    let lots: Record<string, boolean> = {};
    try {
      lots = JSON.parse(read(DRAWN) || "{}") as Record<string, boolean>;
    } catch {
      // A lot that cannot be read is drawn again.
    }
    this.lots = lots;
  }

  isOn(name: string): boolean {
    return this.on.has(name);
  }

  chosen(name: string): boolean {
    return this.picked.has(name);
  }

  drawn(name: string): boolean | undefined {
    return this.lots[name];
  }

  set(name: string, on: boolean): void {
    this.picked.add(name);
    delete this.lots[name];
    this.keep(name, on);
  }

  draw(name: string, on: boolean): void {
    this.lots[name] = on;
    this.keep(name, on);
  }

  private keep(name: string, on: boolean): void {
    if (on) this.on.add(name);
    else this.on.delete(name);
    const line = [...this.on].join(" ");
    write(ON, line);
    write(CHOSEN, [...this.picked].join(" "));
    write(DRAWN, Object.keys(this.lots).length ? JSON.stringify(this.lots) : "");
    if (line) document.documentElement.dataset["flags"] = line;
    else delete document.documentElement.dataset["flags"];
  }
}
