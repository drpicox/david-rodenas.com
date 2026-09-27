import type { Layout } from "../Layout";

const KEY = "portfolio";

function isOn(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return document.documentElement.dataset["portfolio"] === "on";
  }
}

/** The layout, in a browser: the choice kept in storage, and the root element marked to match. */
export class BrowserLayout implements Layout {
  /** The root is marked from what was kept, before anyone asks for anything. */
  settle(): void {
    if (isOn()) document.documentElement.dataset["portfolio"] = "on";
    else delete document.documentElement.dataset["portfolio"];
  }

  apply(choice: "on" | "off" | "toggle"): boolean {
    const on = choice === "toggle" ? !isOn() : choice === "on";
    try {
      if (on) localStorage.setItem(KEY, "on");
      else localStorage.removeItem(KEY);
    } catch {
      // Without storage the choice still holds until the page is left.
    }
    if (on) document.documentElement.dataset["portfolio"] = "on";
    else delete document.documentElement.dataset["portfolio"];
    return on;
  }
}
