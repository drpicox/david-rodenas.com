// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { aKit } from "../../blueprint/aKit";
import type { Offer } from "../kindsFor";
import { openKindMenu } from "./openKindMenu";

const opened = (dragged?: Parameters<typeof openKindMenu>[3]) => {
  const host = document.createElement("div");
  document.body.append(host);
  const taken: Offer[] = [];
  let closed = 0;
  openKindMenu(host, aKit, { left: 10, top: 20 }, dragged, (offer) => taken.push(offer), () => (closed += 1));
  const search = host.querySelector("input") as HTMLInputElement;
  const options = () => [...host.querySelectorAll<HTMLElement>("[role=option]")].map((item) => item.dataset["kind"]);
  const key = (name: string) => search.dispatchEvent(new KeyboardEvent("keydown", { key: name }));
  return { host, search, options, key, taken, closed: () => closed };
};

describe("the menu a node is added from", () => {
  it("shows every kind, shelf by shelf, the features' shelves first, at the place it was asked for", () => {
    const { host, options } = opened();
    expect(options()[0]).toBe("nights");
    expect(host.querySelector(".wb-shelf")?.textContent).toBe("Test");
    expect((host.querySelector(".wb-menu") as HTMLElement).style.left).toBe("10px");
  });

  it("narrows to what is typed, and takes the lit one on Enter", () => {
    const { search, options, key, taken, host } = opened();
    search.value = "scatter";
    search.dispatchEvent(new Event("input"));
    expect(options()).toEqual(["scatter"]);
    expect(host.querySelector(".wb-menu-about")?.textContent).toContain("Two columns against each other");
    key("Enter");
    expect(taken.map((offer) => offer.kind.name)).toEqual(["scatter"]);
    expect(host.querySelector(".wb-menu")).toBeNull();
  });

  it("moves along with the arrows, and closes on Escape taking nothing", () => {
    const { key, taken, closed, host } = opened();
    key("ArrowDown");
    expect(host.querySelector('[aria-selected="true"]')?.getAttribute("data-at")).toBe("1");
    key("Escape");
    expect(taken).toEqual([]);
    expect(closed()).toBe(1);
  });

  it("offers, for a wire pulled out of a table, only what a table goes into, each with the pin it would", () => {
    const { options, host, taken } = opened({ type: "table", side: "output" });
    expect(options()).toContain("bars");
    expect(options()).not.toContain("readout");
    expect((host.querySelector("input") as HTMLInputElement).placeholder).toBe("What does a table go into?");
    (host.querySelector('[data-kind="join"]') as HTMLElement).click();
    expect(taken[0]?.pin).toBe("left");
  });

  it("closes on a click anywhere else", () => {
    const { closed } = opened();
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(closed()).toBe(1);
  });
});
