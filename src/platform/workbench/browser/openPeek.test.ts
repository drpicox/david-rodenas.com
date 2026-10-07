// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { openPeek } from "./openPeek";

const boxed = (element: HTMLElement, left: number, top: number, width: number, height: number) => {
  element.getBoundingClientRect = () => ({ x: left, y: top, left, top, width, height, right: left + width, bottom: top + height, toJSON: () => ({}) });
  return element;
};

describe("a look at what an output gives", () => {
  it("stands beside what was pressed, inside the canvas, and closes on a press anywhere else", () => {
    const host = boxed(document.createElement("div"), 0, 0, 900, 600);
    const anchor = boxed(document.createElement("button"), 200, 100, 60, 20);
    document.body.append(host, anchor);
    openPeek(host, "Nights gives table", '<p class="bp-peek-said">a table: 5 rows</p>', anchor);
    const panel = host.querySelector<HTMLElement>(".wb-peek-panel");
    expect(panel?.textContent).toContain("a table: 5 rows");
    expect([panel?.style.left, panel?.style.top]).toEqual(["270px", "90px"]);
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(host.querySelector(".wb-peek-panel")).toBeNull();
  });
});
