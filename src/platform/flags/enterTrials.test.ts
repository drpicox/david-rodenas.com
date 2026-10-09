import { describe, expect, it } from "vitest";
import { enterTrials } from "./enterTrials";
import type { FlagStore } from "./FlagStore";

function aStore(): FlagStore & { on: Set<string> } {
  const on = new Set<string>();
  const chosen = new Set<string>();
  const drawn = new Map<string, boolean>();
  return {
    on,
    isOn: (name) => on.has(name),
    set: (name, value) => {
      chosen.add(name);
      drawn.delete(name);
      if (value) on.add(name);
      else on.delete(name);
    },
    chosen: (name) => chosen.has(name),
    drawn: (name) => drawn.get(name),
    draw: (name, value) => {
      drawn.set(name, value);
      if (value) on.add(name);
      else on.delete(name);
    },
  };
}

const portfolio = { name: "portfolio", description: "", trial: 0.5 };
const plain = { name: "loud", description: "" };

describe("the trials a reader is entered in", () => {
  it("leave out a flag with choices: a trial draws on or off, not one of several", () => {
    const store = aStore();
    expect(enterTrials([{ name: "search", description: "", choices: ["prompt", "palette"], trial: 0.5 }], store, () => 0.1)).toEqual([]);
    expect(store.on.size).toBe(0);
  });

  it("draw a flag with a trial once, on for the share it asks, and keep what was drawn", () => {
    const store = aStore();
    expect(enterTrials([portfolio, plain], store, () => 0.3)).toEqual([{ name: "portfolio", on: true }]);
    expect(store.on.has("portfolio")).toBe(true);
    // The next visit draws nothing new, and is in the same trial.
    expect(enterTrials([portfolio], store, () => 0.9)).toEqual([{ name: "portfolio", on: true }]);
  });

  it("draw it off above the share", () => {
    const store = aStore();
    expect(enterTrials([portfolio], store, () => 0.7)).toEqual([{ name: "portfolio", on: false }]);
    expect(store.on.has("portfolio")).toBe(false);
  });

  it("leave out a reader who chose for themselves, whatever the lot had said", () => {
    const store = aStore();
    enterTrials([portfolio], store, () => 0.3);
    store.set("portfolio", false);
    expect(enterTrials([portfolio], store, () => 0.3)).toEqual([]);
    expect(store.on.has("portfolio")).toBe(false);
  });
});
