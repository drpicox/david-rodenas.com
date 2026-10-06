// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { aKit } from "../../blueprint/aKit";
import type { Literal } from "../../blueprint/NodeKind";
import { NodeView } from "./NodeView";

const written: [string, string, Literal | undefined, boolean][] = [];
const promoted: string[] = [];
const renamed: string[] = [];
const view = () => new NodeView(aKit, "b", { write: (node, pin, value, done) => written.push([node, pin, value, done]), promote: (_node, pin) => promoted.push(pin), rename: (_node, title) => renamed.push(title) });
const columns = { kind: "choice" as const, choices: [{ value: "year", label: "year" }, { value: "nights", label: "nights" }] };

describe("one node on the canvas", () => {
  it("is drawn as its kind is: a title, its outputs, its inputs with a control each, and a foot", () => {
    const shown = view();
    shown.show({ node: { id: "b", kind: "bars", x: 40, y: 80, values: {} }, result: { state: "missing", pins: ["table"] }, wiredIn: new Set(), wiredOut: new Set(), editors: new Map([["x", columns]]), selected: true });
    const element = shown.element;
    expect(element.className).toBe("wb-node wb-role-paint selected trouble");
    expect([element.style.left, element.style.top]).toEqual(["40px", "80px"]);
    expect(element.querySelector(".wb-title")?.textContent).toBe("Bars");
    expect([...element.querySelectorAll(".wb-in .wb-label")].map((label) => label.textContent)).toEqual(["table", "x", "height", "faint unless"]);
    expect(element.querySelector(".wb-foot")?.textContent).toBe("wire or write: table");
  });

  it("says its kind beside a title of its own, so a node called Station is seen to be a dial, and stands as wide as its kind", () => {
    const shown = new NodeView(aKit, "where", { write: () => {}, promote: () => {}, rename: () => {} });
    shown.show({ node: { id: "where", kind: "dial", x: 0, y: 0, title: "Station", values: { value: "WU" } }, result: undefined, wiredIn: new Set(), wiredOut: new Set(), editors: new Map(), selected: false });
    expect([shown.element.querySelector(".wb-title")?.textContent, shown.element.querySelector(".wb-kind")?.textContent]).toEqual(["Station", "Dial"]);
    expect(shown.element.style.width).toBe("176px");
    shown.show({ node: { id: "where", kind: "dial", x: 0, y: 0, values: { value: "WU" } }, result: undefined, wiredIn: new Set(), wiredOut: new Set(), editors: new Map(), selected: false });
    expect(shown.element.querySelector(".wb-kind")?.textContent).toBe("");
  });

  it("shows no control for an input a wire feeds, and fills its pin", () => {
    const shown = view();
    shown.show({ node: { id: "b", kind: "bars", x: 0, y: 0, values: {} }, result: undefined, wiredIn: new Set(["table"]), wiredOut: new Set(), editors: new Map(), selected: false });
    const table = shown.element.querySelector('.wb-pin[data-pin="table"]');
    expect(table?.classList.contains("open")).toBe(false);
    expect(table?.closest(".wb-row")?.querySelector("select, input")).toBeNull();
  });

  it("offers, in a column's list, the column the node chose itself", () => {
    const shown = view();
    shown.show({ node: { id: "b", kind: "bars", x: 0, y: 0, values: {} }, result: { state: "done", inputs: {}, outputs: {}, settled: { x: "year" }, said: "", key: [] }, wiredIn: new Set(["table"]), wiredOut: new Set(), editors: new Map([["x", columns]]), selected: false });
    const select = shown.element.querySelector('select[aria-label="x"]') as HTMLSelectElement;
    expect(select.options[0]?.textContent).toBe("auto: year");
    select.value = "nights";
    select.dispatchEvent(new Event("change"));
    expect(written.splice(0)).toEqual([["b", "x", "nights", true]]);
  });

  it("keeps showing what a list starts with, however often it is drawn again", () => {
    const shown = new NodeView(aKit, "c", { write: () => {}, promote: () => {}, rename: () => {} });
    const of = { kind: "choice" as const, choices: [{ value: "values", label: "the values" }, { value: "ranks", label: "the ranks" }] };
    const draw = () => shown.show({ node: { id: "c", kind: "correlation", x: 0, y: 0, values: {} }, result: undefined, wiredIn: new Set(["table"]), wiredOut: new Set(), editors: new Map([["of", of]]), selected: false });
    draw();
    draw();
    expect((shown.element.querySelector('select[aria-label="of"]') as HTMLSelectElement).value).toBe("values");
  });

  it("puts an input on the board, and is renamed in place", () => {
    const shown = new NodeView(aKit, "n", { write: () => {}, promote: (_node, pin) => promoted.push(pin), rename: (_node, title) => renamed.push(title) });
    shown.show({ node: { id: "n", kind: "nights", x: 0, y: 0, values: {} }, result: undefined, wiredIn: new Set(), wiredOut: new Set(), editors: new Map([["from", { kind: "number" as const }]]), selected: false });
    (shown.element.querySelector(".wb-promote") as HTMLButtonElement).click();
    expect(promoted.splice(0)).toEqual(["from"]);
    const title = shown.element.querySelector(".wb-title") as HTMLElement;
    title.dispatchEvent(new MouseEvent("dblclick"));
    title.textContent = "Nights at home";
    title.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(renamed.splice(0)).toEqual(["Nights at home"]);
  });

  it("says a kind there is none of", () => {
    const shown = view();
    shown.show({ node: { id: "b", kind: "teleport", x: 0, y: 0, values: {} }, result: { state: "unknown" }, wiredIn: new Set(), wiredOut: new Set(), editors: new Map(), selected: false });
    expect(shown.element.querySelector(".wb-title")?.textContent).toBe("teleport");
    expect(shown.element.querySelector(".wb-foot")?.textContent).toBe("there is no kind of node called teleport");
  });
});
