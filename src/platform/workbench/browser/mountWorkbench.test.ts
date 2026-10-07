// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { aKit } from "../../blueprint/aKit";
import { kitOf } from "../../blueprint/kitOf";
import type { NodeKind } from "../../blueprint/NodeKind";
import { askProgram } from "../../browser/askProgram";
import { linkCodeOf } from "../linkCodeOf";
import { mountWorkbench } from "./mountWorkbench";

const place = (source: string) => {
  const host = document.createElement("div");
  host.className = "app";
  host.dataset["app"] = "blueprint";
  host.dataset["source"] = source;
  host.innerHTML = "<p>the still</p>";
  document.body.append(host);
  return host;
};

afterEach(() => {
  document.body.replaceChildren();
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("a blueprint written in a page, once the script is there", () => {
  it("takes the still's place, named after its place among the page's blueprints", () => {
    place("n = nights");
    const host = place("bars");
    const stop = mountWorkbench(aKit)(host);
    expect(host.id).toBe("blueprint-2");
    expect(host.textContent).not.toContain("the still");
    expect(host.querySelector(".workbench .wb-node")).not.toBeNull();
    stop();
  });

  it("offers every blueprint of the page, each by the heading it stands under", () => {
    const heading = document.createElement("h2");
    heading.textContent = "Hot nights";
    document.body.append(heading);
    place("n = nights");
    const second = document.createElement("h2");
    second.textContent = "Bars";
    document.body.append(second);
    const host = place("m = nights\nbars table: m");
    mountWorkbench(aKit)(host);
    (host.querySelector(".wb-examples-button") as HTMLButtonElement).click();
    expect([...host.querySelectorAll(".wb-examples li strong")].map((title) => title.textContent)).toEqual(["Hot nights", "Bars"]);
  });

  const MANY = "## Hot nights\n# The nights alone.\nn = nights @ 0 0\n\n## Bars\nm = nights @ 0 0\nbars table: m @ 400 0";
  const nodes = (host: HTMLElement) => [...host.querySelectorAll(".wb-node")].map((node) => node.getAttribute("data-node"));

  it("offers every blueprint one place holds, each by its own title, opening on the first", () => {
    const host = place(MANY);
    mountWorkbench(aKit)(host);
    expect(nodes(host)).toEqual(["n"]);
    (host.querySelector(".wb-examples-button") as HTMLButtonElement).click();
    expect([...host.querySelectorAll(".wb-examples li strong")].map((title) => title.textContent)).toEqual(["Hot nights", "Bars"]);
  });

  it("opens the one the address names, and another when a link names it, standing where the link lands", () => {
    window.history.replaceState(null, "", "/#bars");
    const landed: Element[] = [];
    Element.prototype.scrollIntoView = function (this: Element) {
      landed.push(this);
    };
    const host = place(MANY);
    mountWorkbench(aKit)(host);
    expect(nodes(host)).toEqual(["m", "bars"]);
    expect(landed).toEqual([document.getElementById("bars")]);
    expect(host.contains(document.getElementById("hot-nights"))).toBe(true);
    window.history.pushState(null, "", "/#hot-nights");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect(nodes(host)).toEqual(["n"]);
  });

  it("names in the address only what the place itself holds", () => {
    const host = place("## Hot nights\nn = nights @ 0 0");
    place("## Bars\nm = nights @ 0 0\nbars table: m @ 400 0");
    mountWorkbench(aKit)(host);
    (host.querySelector(".wb-examples-button") as HTMLButtonElement).click();
    (host.querySelectorAll(".wb-examples li button")[1] as HTMLButtonElement).click();
    expect(nodes(host)).toEqual(["m", "bars"]);
    expect(window.location.hash).toBe("");
  });

  it("says in the address which one is open, once the reader opens another", () => {
    const host = place(MANY);
    mountWorkbench(aKit)(host);
    (host.querySelector(".wb-examples-button") as HTMLButtonElement).click();
    (host.querySelectorAll(".wb-examples li button")[1] as HTMLButtonElement).click();
    expect(window.location.hash).toBe("#bars");
  });

  it("starts as the reader left it, kept in their browser", () => {
    const host = place("n = nights @ 0 0");
    const first = mountWorkbench(aKit)(host);
    (host.querySelector(".wb-promote") as HTMLButtonElement).click();
    first();
    const again = place("n = nights @ 0 0");
    mountWorkbench(aKit)(again);
    expect(again.querySelectorAll(".wb-node").length).toBe(2);
    expect(again.querySelector(".wb-status")?.textContent).toContain("As you left it");
  });

  it("puts an agent's blueprint on its canvas when asked, as an edit that can be undone", () => {
    const host = place("n = nights @ 0 0");
    mountWorkbench(aKit)(host);
    askProgram(host, { text: "x = nights @ 0 0\nbars table: x @ 400 0" });
    expect([...host.querySelectorAll(".wb-node")].map((node) => node.getAttribute("data-node"))).toEqual(["x", "bars"]);
    expect(host.querySelector(".wb-status")?.textContent).toBe("Written by an agent. Undo, or Reset, goes back.");
  });

  it("offers a kind on trial only where the flags say its own is on", () => {
    const trial: NodeKind = { ...(aKit.kinds.get("bars") as NodeKind), name: "big-bars", title: "Big bars", flag: "recipes" };
    const kit = kitOf([...aKit.kinds.values(), trial], [...aKit.types.values()]);
    const offered = (isOn?: (flag: string) => boolean) => {
      document.body.replaceChildren();
      const host = place("n = nights @ 0 0");
      mountWorkbench(kit, isOn)(host);
      host.querySelector(".wb-canvas")?.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, clientX: 10, clientY: 10 }));
      return [...host.querySelectorAll<HTMLElement>(".wb-menu [role=option]")].map((item) => item.dataset["kind"]);
    };
    expect(offered()).not.toContain("big-bars");
    expect(offered((flag) => flag === "recipes")).toContain("big-bars");
  });

  it("starts as a link to it carried it", () => {
    window.history.replaceState(null, "", `/?blueprint=${linkCodeOf("x = nights @ 0 0\nbars table: x @ 400 0")}#blueprint-1`);
    const host = place("n = nights");
    mountWorkbench(aKit)(host);
    expect([...host.querySelectorAll(".wb-node")].map((node) => node.getAttribute("data-node"))).toEqual(["x", "bars"]);
  });
});
