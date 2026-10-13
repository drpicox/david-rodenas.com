// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { openChoice } from "./openChoice";

const CHOICES = [{ label: "left", said: "from Nights", colour: "--bp-table" }, { label: "right" }];

function asked() {
  const host = document.createElement("div");
  document.body.append(host);
  const chosen: number[] = [];
  let closed = 0;
  const close = openChoice(host, { left: 12.4, top: 30 }, "Which input of Join?", CHOICES, (at) => chosen.push(at), () => (closed += 1));
  const pads = () => [...host.querySelectorAll<HTMLButtonElement>(".lc-choice button")];
  return { host, chosen, closed: () => closed, close, pads };
}

afterEach(() => document.body.replaceChildren());

describe("a question the display asks, answered by a pad", () => {
  it("is asked where it is told to, with a pad for each answer, saying what the answer is and what there is to say of it", () => {
    const { host, pads } = asked();
    const menu = host.querySelector(".lc-choice") as HTMLElement;
    expect([menu.getAttribute("role"), menu.getAttribute("aria-label"), menu.style.left, menu.style.top]).toEqual(["dialog", "Which input of Join?", "12px", "30px"]);
    expect(menu.querySelector("p")?.textContent).toBe("Which input of Join?");
    expect(pads().map((pad) => [pad.querySelector("strong")?.textContent, pad.querySelector("span")?.textContent ?? null, pad.style.getPropertyValue("--pin")])).toEqual([
      ["left", "from Nights", "var(--bp-table)"],
      ["right", null, ""],
    ]);
    expect(document.activeElement).toBe(pads()[0]);
  });

  it("gives the answer pressed, once it has closed", () => {
    const { host, pads, chosen, closed } = asked();
    pads()[1]?.click();
    expect(host.querySelector(".lc-choice")).toBeNull();
    expect([chosen, closed()]).toEqual([[1], 1]);
  });

  it("closes with no answer on Escape, which goes no further, on a press anywhere else, and when told to", () => {
    const escaped = asked();
    let heard = 0;
    escaped.host.addEventListener("keydown", () => (heard += 1));
    escaped.pads()[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect([escaped.host.querySelector(".lc-choice"), escaped.chosen, escaped.closed(), heard]).toEqual([null, [], 1, 0]);

    const outside = asked();
    outside.pads()[0]?.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(outside.closed()).toBe(0);
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect([outside.host.querySelector(".lc-choice"), outside.closed()]).toEqual([null, 1]);
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(outside.closed()).toBe(1);

    const told = asked();
    told.close();
    expect([told.host.querySelector(".lc-choice"), told.closed()]).toEqual([null, 1]);
  });

  it("moves from pad to pad with the arrows", () => {
    const { pads } = asked();
    const arrow = (key: string) => document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    arrow("ArrowDown");
    expect(document.activeElement).toBe(pads()[1]);
    arrow("ArrowDown");
    expect(document.activeElement).toBe(pads()[1]);
    arrow("ArrowUp");
    expect(document.activeElement).toBe(pads()[0]);
  });
});
