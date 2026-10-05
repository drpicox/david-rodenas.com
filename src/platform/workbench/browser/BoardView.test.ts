// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import type { Dial } from "../../blueprint/dialsOf";
import type { Literal } from "../../blueprint/NodeKind";
import { BoardView } from "./BoardView";

const turned: [string, Literal, boolean][] = [];
const found: string[] = [];
const board = () => new BoardView({ turn: (node, value, done) => turned.push([node, value, done]), find: (node) => found.push(node) });
const station: Dial = { node: "where", label: "Station", value: "WU", editor: { kind: "choice", choices: [{ value: "WU", label: "Badalona" }, { value: "X4", label: "el Raval" }] }, said: "Badalona", targets: [] };

describe("the board beside the canvas", () => {
  it("has a control for each dial, which turns it", () => {
    const view = board();
    view.show([station], []);
    const select = view.element.querySelector("select") as HTMLSelectElement;
    expect(view.element.querySelector(".wb-dial-name")?.textContent).toBe("Station");
    select.value = "X4";
    select.dispatchEvent(new Event("change"));
    expect(turned.splice(0)).toEqual([["where", "X4", true]]);
  });

  it("keeps a dial's control when only its value changed, and shows the value", () => {
    const view = board();
    view.show([station], []);
    const select = view.element.querySelector("select");
    view.show([{ ...station, value: "X4" }], []);
    expect(view.element.querySelector("select")).toBe(select);
    expect((select as HTMLSelectElement).value).toBe("X4");
  });

  it("shows every picture under its node's title, which finds the node", () => {
    const view = board();
    view.show([], [{ node: "b", title: "Nights a year", painting: { html: "<svg><rect data-key=\"bar:1\" height=\"3\"></rect></svg>", caption: "nights by year", credits: ["Meteocat."] } }]);
    expect(view.element.querySelector(".bp-caption")?.textContent).toBe("nights by year");
    expect(view.element.querySelector(".bp-credits")?.textContent).toBe("Source: Meteocat.");
    (view.element.querySelector("button.wb-find") as HTMLButtonElement).click();
    expect(found.splice(0)).toEqual(["b"]);
  });

  it("draws a picture again in place, so what grows is seen growing", () => {
    const view = board();
    view.show([], [{ node: "b", title: "Bars", painting: { html: '<svg><rect data-key="bar:1" height="3"></rect></svg>' } }]);
    const bar = view.element.querySelector("rect");
    view.show([], [{ node: "b", title: "Bars", painting: { html: '<svg><rect data-key="bar:1" height="9"></rect></svg>' } }]);
    expect(view.element.querySelector("rect")).toBe(bar);
    expect(bar?.getAttribute("height")).toBe("9");
  });

  it("says why a picture is not there, and how to get one when there are none", () => {
    const view = board();
    view.show([], []);
    expect((view.element.querySelector(".wb-empty") as HTMLElement).hidden).toBe(false);
    view.show([], [{ node: "b", title: "Bars", problem: "height: the table has no column rain" }]);
    expect(view.element.querySelector(".bp-problem")?.textContent).toBe("height: the table has no column rain");
    expect((view.element.querySelector(".wb-empty") as HTMLElement).hidden).toBe(true);
  });
});
