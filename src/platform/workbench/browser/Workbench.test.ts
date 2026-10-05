// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { aKit } from "../../blueprint/aKit";
import { NODE } from "../../blueprint/NODE";
import { nodeShapeOf } from "../../blueprint/nodeShapeOf";
import { parseBlueprint } from "../../blueprint/parseBlueprint";
import { FilesInBrowser } from "./FilesInBrowser";
import { Workbench, type WorkbenchSetting } from "./Workbench";

const settle = () => new Promise((resolve) => setTimeout(resolve, 5));
const Pointer = (window.PointerEvent ?? MouseEvent) as typeof MouseEvent;

/** A workbench on the page with a blueprint, and what it keeps and copies. */
function bench(example: string, more: Partial<WorkbenchSetting> = {}) {
  const kept: (string | null)[] = [];
  const workbench = new Workbench({ kit: aKit, files: new FilesInBrowser(async () => ""), example, keep: (text) => kept.push(text), linkTo: (text) => `link:${text}`, copy: async () => {}, ...more });
  document.body.replaceChildren(workbench.element);
  workbench.wake();
  return { workbench, element: workbench.element, kept };
}

/** Where a pin is drawn, on a canvas looked at as it is. */
function pinPoint(element: HTMLElement, node: string, pin: string, side: "inputs" | "outputs") {
  const view = element.querySelector<HTMLElement>(`.wb-node[data-node="${node}"]`)!;
  const [x, y] = [Number.parseFloat(view.style.left), Number.parseFloat(view.style.top)];
  const kind = aKit.kinds.get(view.className.includes("wb-role-paint") ? "bars" : "nights");
  const at = nodeShapeOf(kind)[side].get(pin)!;
  return { clientX: x + at.x, clientY: y + at.y };
}

function press(target: Element, point: { clientX: number; clientY: number }, extra: MouseEventInit = {}) {
  target.dispatchEvent(new Pointer("pointerdown", { bubbles: true, button: 0, ...point, ...extra }));
}
function move(canvas: Element, point: { clientX: number; clientY: number }) {
  canvas.dispatchEvent(new Pointer("pointermove", { bubbles: true, ...point }));
}
function release(canvas: Element, point: { clientX: number; clientY: number }) {
  canvas.dispatchEvent(new Pointer("pointerup", { bubbles: true, ...point }));
}
const key = (element: Element, name: string, extra: KeyboardEventInit = {}) => element.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, ...extra }));

afterEach(() => document.body.replaceChildren());

describe("a blueprint worked on in the page", () => {
  it("stands its nodes on the canvas, and paints its pictures on the board once it has run", async () => {
    const { element } = bench('n = nights\nbars "Nights a year" table: n');
    expect([...element.querySelectorAll(".wb-node")].map((node) => node.getAttribute("data-node"))).toEqual(["n", "bars"]);
    expect(element.querySelectorAll(".wb-wire").length).toBe(1);
    await settle();
    expect(element.querySelector(".wb-board figcaption")?.textContent).toBe("Nights a year");
    expect(element.querySelector(".wb-board .bp-caption")?.textContent).toBe("nights by year, 5 bars");
    expect(element.querySelector('.wb-node[data-node="n"] .wb-foot')?.textContent).toBe("5 rows · year, nights");
  });

  it("runs again when a value is written on a node, and keeps the reader's version", async () => {
    const { element, kept } = bench("n = nights\nbars table: n");
    await settle();
    const from = element.querySelector('.wb-node[data-node="n"] input[type="number"]') as HTMLInputElement;
    from.value = "2010";
    from.dispatchEvent(new Event("change"));
    await settle();
    expect(element.querySelector(".wb-board svg title")?.textContent).toBe("2010: 10 nights");
    expect(kept.at(-1)).toContain("n = nights from: 2010");
  });

  it("wires an output into an input by dragging from one pin to the other", async () => {
    const { element } = bench("n = nights @ 0 0\nbars @ 400 0");
    const canvas = element.querySelector(".wb-canvas")!;
    const out = element.querySelector('.wb-node[data-node="n"] .wb-pin[data-side="output"]')!;
    press(out, pinPoint(element, "n", "table", "outputs"));
    move(canvas, { clientX: 300, clientY: 80 });
    expect(element.querySelector(".wb-wire.dragging")).not.toBeNull();
    release(canvas, pinPoint(element, "bars", "table", "inputs"));
    expect(element.querySelectorAll(".wb-wire").length).toBe(1);
    await settle();
    expect(element.querySelector(".wb-board .bp-painting svg")).not.toBeNull();
  });

  it("refuses, in words, a wire between what cannot meet", () => {
    const { element } = bench("n = nights @ 0 0\nreadout @ 400 0");
    const canvas = element.querySelector(".wb-canvas")!;
    press(element.querySelector('.wb-node[data-node="n"] .wb-pin[data-side="output"]')!, pinPoint(element, "n", "table", "outputs"));
    const readout = element.querySelector<HTMLElement>('.wb-node[data-node="readout"]')!;
    const at = nodeShapeOf(aKit.kinds.get("readout")).inputs.get("value")!;
    release(canvas, { clientX: 400 + at.x, clientY: at.y });
    expect(element.querySelectorAll(".wb-wire").length).toBe(0);
    expect(element.querySelector(".wb-status")?.textContent).toBe("Not wired: a table cannot go into value, which takes a number.");
    expect(readout).toBeTruthy();
  });

  it("offers, for a wire dropped in empty space, what it could go into, and stands the chosen node there, wired", () => {
    const { element } = bench("n = nights @ 0 0");
    const canvas = element.querySelector(".wb-canvas")!;
    press(element.querySelector(".wb-pin[data-side=output]")!, pinPoint(element, "n", "table", "outputs"));
    release(canvas, { clientX: 520, clientY: 300 });
    const search = element.querySelector(".wb-menu input") as HTMLInputElement;
    expect(search.placeholder).toBe("What does a table go into?");
    search.value = "scatter";
    search.dispatchEvent(new Event("input"));
    search.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    const added = element.querySelector<HTMLElement>('.wb-node[data-node="scatter"]')!;
    expect(added.style.left).toBe("520px");
    expect(element.querySelectorAll(".wb-wire").length).toBe(1);
  });

  it("lets go of a wire pulled off its input and dropped where nothing is chosen", () => {
    const { element } = bench("n = nights @ 0 0\nbars table: n @ 400 0");
    const canvas = element.querySelector(".wb-canvas")!;
    press(element.querySelector('.wb-node[data-node="bars"] .wb-pin[data-side="input"]')!, pinPoint(element, "bars", "table", "inputs"));
    release(canvas, { clientX: 300, clientY: 400 });
    key(element.querySelector(".wb-menu input")!, "Escape");
    expect(element.querySelectorAll(".wb-wire").length).toBe(0);
  });

  it("moves a node dragged by its title, as one step to undo", () => {
    const { element } = bench("n = nights @ 0 0");
    const canvas = element.querySelector(".wb-canvas")!;
    press(element.querySelector(".wb-head")!, { clientX: 20, clientY: 10 });
    move(canvas, { clientX: 70, clientY: 40 });
    release(canvas, { clientX: 120, clientY: 110 });
    const node = element.querySelector<HTMLElement>(".wb-node")!;
    expect([node.style.left, node.style.top]).toEqual(["100px", "100px"]);
    key(canvas, "z", { ctrlKey: true });
    expect([node.style.left, node.style.top]).toEqual(["0px", "0px"]);
  });

  it("takes away the chosen nodes with Delete, and Ctrl+Z brings them back", () => {
    const { element } = bench("n = nights @ 0 0\nbars table: n @ 400 0");
    const canvas = element.querySelector(".wb-canvas")!;
    press(element.querySelector('.wb-node[data-node="bars"] .wb-head')!, { clientX: 420, clientY: 10 });
    release(canvas, { clientX: 420, clientY: 10 });
    key(canvas, "Delete");
    expect(element.querySelectorAll(".wb-node").length).toBe(1);
    expect(element.querySelectorAll(".wb-wire").length).toBe(0);
    key(canvas, "z", { metaKey: true });
    expect(element.querySelectorAll(".wb-node").length).toBe(2);
    key(canvas, "z", { metaKey: true, shiftKey: true });
    expect(element.querySelectorAll(".wb-node").length).toBe(1);
  });

  it("puts an input on the board as a dial, which turns it", async () => {
    const { element } = bench("n = nights @ 400 0\nbars table: n @ 800 0");
    await settle();
    (element.querySelector('.wb-node[data-node="n"] .wb-promote') as HTMLButtonElement).click();
    expect(element.querySelector(".wb-status")?.textContent).toBe("from is on the board now, as a dial.");
    await settle();
    const slider = element.querySelector(".wb-board .wb-dial input[type=range]") as HTMLInputElement;
    expect(element.querySelector(".wb-dial-name")?.textContent).toBe("from");
    slider.value = "2020";
    slider.dispatchEvent(new Event("change"));
    await settle();
    expect(element.querySelector(".wb-board svg title")?.textContent).toBe("2020: 10 nights");
  });

  it("opens a menu of every kind on a double click, standing the chosen node where it was asked", () => {
    const { element } = bench("");
    const canvas = element.querySelector<HTMLElement>(".wb-canvas")!;
    expect(canvas.classList.contains("blank")).toBe(true);
    canvas.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, clientX: 100, clientY: 60 }));
    (element.querySelector('.wb-menu [data-kind="nights"]') as HTMLElement).click();
    expect(element.querySelector<HTMLElement>('.wb-node[data-node="nights"]')?.style.left).toBe("100px");
  });

  it("is written as text, and rewritten from text, keeping where the nodes it knows stand", () => {
    const { element } = bench("n = nights @ 40 40");
    (element.querySelector('button[title^="The blueprint as text"]') as HTMLButtonElement).click();
    const area = element.querySelector(".wb-text textarea") as HTMLTextAreaElement;
    expect(area.value).toBe("nights");
    area.value = "n = nights from: 1999";
    (element.querySelector(".wb-apply") as HTMLButtonElement).click();
    const node = element.querySelector<HTMLElement>('.wb-node[data-node="n"]')!;
    expect(node.style.left).toBe("40px");
    expect((node.querySelector('input[type="number"]') as HTMLInputElement).value).toBe("1999");
  });

  it("starts from the reader's own version when there is one, and goes back to the page's on Reset", () => {
    const { element, kept } = bench("n = nights @ 0 0", { start: { text: "n = nights from: 2015 @ 0 0\nbars table: n @ 400 0", said: "As you left it." } });
    expect(element.querySelectorAll(".wb-node").length).toBe(2);
    expect(element.querySelector(".wb-status")?.textContent).toBe("As you left it.");
    (element.querySelector('button[title^="Go back"]') as HTMLButtonElement).click();
    expect(element.querySelectorAll(".wb-node").length).toBe(1);
    expect(kept.at(-1)).toBeNull();
  });

  it("copies a link to the blueprint as it is", async () => {
    const copied: string[] = [];
    const { element } = bench("n = nights @ 0 0", { copy: async (text) => void copied.push(text) });
    (element.querySelector('button[title^="Copy a link"]') as HTMLButtonElement).click();
    await settle();
    expect(copied).toEqual(["link:nights @ 0 0"]);
    expect(parseBlueprint("nights @ 0 0", aKit).placed).toBe(true);
  });

  it("waits to run until it is near the screen, showing the board the build wrote until it has", async () => {
    const workbench = new Workbench({ kit: aKit, files: new FilesInBrowser(async () => ""), example: "n = nights\nbars table: n", stillBoard: '<figure class="bp-card">the still</figure>', keep: () => {}, linkTo: String, copy: async () => {} });
    await settle();
    expect(workbench.element.querySelector(".wb-cards")?.textContent).toBe("the still");
    workbench.wake();
    await settle();
    expect(workbench.element.querySelector(".wb-cards .bp-painting svg")).not.toBeNull();
  });

  it("goes full screen, and back on Escape", () => {
    const { element } = bench("n = nights @ 0 0");
    (element.querySelector(".wb-full-button") as HTMLButtonElement).click();
    expect(element.classList.contains("full")).toBe(true);
    expect(document.body.classList.contains("wb-full-open")).toBe(true);
    key(element.querySelector(".wb-canvas")!, "Escape");
    expect(element.classList.contains("full")).toBe(false);
  });

  it("chooses nodes in a rectangle dragged with Shift", () => {
    const { element } = bench("a = nights @ 0 0\nb = nights @ 0 200\nc = nights @ 600 0");
    const canvas = element.querySelector(".wb-canvas")!;
    press(canvas, { clientX: -10, clientY: -10 }, { shiftKey: true });
    move(canvas, { clientX: NODE.width + 20, clientY: 400 });
    release(canvas, { clientX: NODE.width + 20, clientY: 400 });
    expect([...element.querySelectorAll(".wb-node.selected")].map((node) => node.getAttribute("data-node"))).toEqual(["a", "b"]);
  });
});
