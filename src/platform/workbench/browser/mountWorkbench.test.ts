// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { aKit } from "../../blueprint/aKit";
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

  it("starts as a link to it carried it", () => {
    window.history.replaceState(null, "", `/?blueprint=${linkCodeOf("x = nights @ 0 0\nbars table: x @ 400 0")}#blueprint-1`);
    const host = place("n = nights");
    mountWorkbench(aKit)(host);
    expect([...host.querySelectorAll(".wb-node")].map((node) => node.getAttribute("data-node"))).toEqual(["x", "bars"]);
  });
});
