// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Chosen } from "../detailsOf";
import { encodeHistory } from "../encodeHistory";
import { readHistory } from "../readHistory";
import { detailsPanel } from "./detailsPanel";

const file = (path: string) => ({ path, lines: 10, test: false, typesOnly: false });
const needs = (from: string, to: string) => ({ from, to, typeOnly: false });
const graph = (paths: string[]) => ({ modules: paths.map(file), dependencies: paths.includes("features/f/f.ts") ? [needs("features/f/f.ts", "platform/p/a.ts")] : [] });
const step = (sha: string, day: number, paths: string[], touched: string[]) => ({ commit: { sha, date: `2026-09-0${day}T10:00:00+02:00`, subject: sha }, graph: graph(paths), renamed: [], touched });
// Two files, then a third; a.ts changed at every commit after it was written.
const read = readHistory(
  JSON.stringify(
    encodeHistory([
      step("aaaaaaa", 1, ["platform/p/a.ts", "platform/p/b.ts"], []),
      step("bbbbbbb", 2, ["platform/p/a.ts", "platform/p/b.ts"], ["platform/p/a.ts"]),
      step("ccccccc", 3, ["platform/p/a.ts", "platform/p/b.ts", "features/f/f.ts"], ["platform/p/a.ts"]),
    ]),
  ),
);

describe("the panel beside the picture", () => {
  afterEach(() => vi.useRealTimers());

  it("says what is chosen at a commit: the network with nothing chosen, a file's details with one", () => {
    const panel = detailsPanel(read, null, () => {});
    panel.tell(2, null, true);
    expect(panel.element.textContent).toContain("The network");
    panel.tell(2, { file: "platform/p/a.ts" }, true);
    expect(panel.element.querySelector("h3")?.textContent).toBe("platform/p/a.ts");
  });

  it("hands every name in it to whoever chooses: a box, a file, and the way back to the network", () => {
    const chosen: Chosen[] = [];
    const panel = detailsPanel(read, null, (one) => chosen.push(one));
    panel.tell(2, { file: "platform/p/a.ts" }, true);
    panel.element.querySelector<HTMLButtonElement>("button[data-box]")?.click();
    panel.element.querySelector<HTMLButtonElement>("button[data-back]")?.click();
    panel.tell(2, null, true);
    panel.element.querySelector<HTMLButtonElement>("button[data-file]")?.click();
    expect(chosen).toEqual([{ box: "platform/p" }, null, { file: expect.any(String) }]);
  });

  it("waits for the commit to stop moving, and then says the last", () => {
    vi.useFakeTimers();
    const panel = detailsPanel(read, null, () => {});
    panel.tell(0, null);
    panel.tell(1, null);
    panel.tell(2, null);
    expect(panel.element.textContent).toBe("");
    vi.advanceTimersByTime(100);
    expect(panel.element.textContent).toContain("3, joined by 1 arrow");
  });

  it("keeps open the commits the reader opened, as the history moves on under them", () => {
    const panel = detailsPanel(read, null, () => {});
    panel.tell(1, { file: "platform/p/a.ts" }, true);
    const list = panel.element.querySelector("details");
    if (!list) throw new Error("no list of commits");
    list.open = true;
    panel.tell(2, { file: "platform/p/a.ts" }, true);
    expect(panel.element.querySelector("details")?.open).toBe(true);
  });
});
