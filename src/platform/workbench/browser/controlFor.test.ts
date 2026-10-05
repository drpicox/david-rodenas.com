// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import type { Literal } from "../../blueprint/NodeKind";
import { controlFor } from "./controlFor";

const told: [Literal | undefined, boolean][] = [];
const changed = (value: Literal | undefined, done: boolean) => {
  told.push([value, done]);
};

describe("the control that sets one input", () => {
  it("is a list for a choice, offering the node's own pick when it may choose, and saying which it was", () => {
    const control = controlFor({ kind: "choice", choices: [{ value: "tx", label: "tx" }, { value: "tn", label: "tn" }] }, undefined, { style: "inline", optional: true, settled: "tx", label: "y", changed });
    const select = control.element as HTMLSelectElement;
    expect([...select.options].map((option) => option.textContent)).toEqual(["auto: tx", "tx", "tn"]);
    select.value = "tn";
    select.dispatchEvent(new Event("change"));
    select.value = "";
    select.dispatchEvent(new Event("change"));
    expect(told.splice(0)).toEqual([["tn", true], [undefined, true]]);
  });

  it("is a box for yes or no", () => {
    const control = controlFor({ kind: "flag" }, true, { style: "inline", label: "fit", changed });
    const box = control.element as HTMLInputElement;
    expect(box.checked).toBe(true);
    box.checked = false;
    box.dispatchEvent(new Event("change"));
    expect(told.splice(0)).toEqual([[false, true]]);
  });

  it("is, on the board, a slider for a number with a range, saying the value as its editor says it while it moves", () => {
    const control = controlFor({ kind: "number", min: 0, max: 10, step: 1, show: (value) => `day ${value}` }, 3, { style: "dial", label: "commit", changed });
    const slider = control.element.querySelector("input") as HTMLInputElement;
    expect(control.element.querySelector("output")?.textContent).toBe("day 3");
    slider.value = "7";
    slider.dispatchEvent(new Event("input"));
    expect(control.element.querySelector("output")?.textContent).toBe("day 7");
    expect(told.splice(0)).toEqual([[7, false]]);
  });

  it("is a field for a number elsewhere, empty meaning the node chooses", () => {
    const control = controlFor({ kind: "number", step: 0.5 }, undefined, { style: "inline", optional: true, settled: "25", label: "threshold", changed });
    const field = control.element as HTMLInputElement;
    expect(field.placeholder).toBe("25");
    field.value = "22.5";
    field.dispatchEvent(new Event("input"));
    field.value = "";
    field.dispatchEvent(new Event("change"));
    expect(told.splice(0)).toEqual([[22.5, false], [undefined, true]]);
  });

  it("is a field for words, or a box of several lines when its editor asks for them", () => {
    const one = controlFor({ kind: "text" }, "year month", { style: "inline", label: "on", changed });
    expect((one.element as HTMLInputElement).value).toBe("year month");
    const many = controlFor({ kind: "text", lines: 4 }, "x, y", { style: "inline", label: "text", changed });
    expect(many.element.tagName).toBe("TEXTAREA");
    many.show("a, b");
    expect((many.element as HTMLTextAreaElement).value).toBe("a, b");
  });
});
