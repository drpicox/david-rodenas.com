// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { aKit } from "../../blueprint/aKit";
import type { Example } from "../../blueprint/examplesOf";
import { NODE } from "../../blueprint/NODE";
import { nodeShapeOf } from "../../blueprint/nodeShapeOf";
import { parseBlueprint } from "../../blueprint/parseBlueprint";
import { FilesInBrowser } from "./FilesInBrowser";
import { Workbench, type WorkbenchSetting } from "./Workbench";

const settle = () => new Promise((resolve) => setTimeout(resolve, 5));
const Pointer = (window.PointerEvent ?? MouseEvent) as typeof MouseEvent;

const anExample = (text: string, title = "", about = ""): Example => ({ title, slug: title.toLowerCase().replace(/\W+/g, "-"), about, text });

/** A workbench on the page with a blueprint — or several — and what it keeps of each, the reader's own versions it starts with, and what it copies. */
function bench(example: string | readonly Example[], more: Partial<WorkbenchSetting> = {}, left: Readonly<Record<string, string>> = {}) {
  const kept: (string | null)[] = [];
  const opened: Example[] = [];
  const examples = typeof example === "string" ? [anExample(example)] : example;
  const workbench = new Workbench({
    kit: aKit,
    files: new FilesInBrowser(async () => ""),
    examples,
    own: { get: (one) => left[one.title] ?? null, set: (_, text) => kept.push(text) },
    opened: (one) => opened.push(one),
    linkTo: (_, text) => `link:${text}`,
    copy: async () => {},
    ...more,
  });
  document.body.replaceChildren(workbench.element);
  workbench.wake();
  return { workbench, element: workbench.element, kept, opened };
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

  it("lights, while a wire is dragged, every pin it could go into, and dims the rest", () => {
    const { element } = bench("n = nights @ 0 0\nbars @ 400 0\nreadout @ 400 200");
    const canvas = element.querySelector(".wb-canvas")!;
    press(element.querySelector('.wb-node[data-node="n"] .wb-pin[data-side="output"]')!, pinPoint(element, "n", "table", "outputs"));
    expect(canvas.classList.contains("wiring")).toBe(true);
    const lit = [...element.querySelectorAll(".wb-pin.fits")].map((pin) => `${pin.closest(".wb-node")?.getAttribute("data-node")}.${pin.getAttribute("data-pin")}`);
    expect(lit).toEqual(["bars.table"]);
    release(canvas, { clientX: 300, clientY: 400 });
    key(element.querySelector(".wb-menu input")!, "Escape");
    expect(canvas.classList.contains("wiring")).toBe(false);
    expect(element.querySelectorAll(".wb-pin.fits").length).toBe(0);
  });

  it("stands a node added from the toolbar where nothing else stands", () => {
    const { element } = bench("n = nights @ 0 0");
    (element.querySelector(".wb-add") as HTMLButtonElement).click();
    (element.querySelector('.wb-menu [data-kind="nights"]') as HTMLElement).click();
    const [first, added] = [...element.querySelectorAll<HTMLElement>(".wb-node")];
    const overlap = Math.abs(Number.parseFloat(first!.style.top) - Number.parseFloat(added!.style.top)) < nodeShapeOf(aKit.kinds.get("nights")).height && Math.abs(Number.parseFloat(first!.style.left) - Number.parseFloat(added!.style.left)) < NODE.width;
    expect(overlap).toBe(false);
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
    expect(element.querySelector(".wb-status")?.textContent).toBe("from is on the board now, as a dial — and on the canvas, beside the node it turns.");
    const dial = element.querySelector<HTMLElement>('.wb-node[data-node="from"]')!;
    expect(dial.style.left).toBe(`${400 - NODE.dial - 48}px`);
    expect(Number.parseFloat(dial.style.top) + NODE.header + NODE.row / 2).toBe(nodeShapeOf(aKit.kinds.get("nights")).inputs.get("from")!.y);
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

  it("says, in a menu with room beside its list, which of the page's examples a kind is found in", () => {
    const { element } = bench([anExample("n = nights @ 0 0", "Nights"), anExample("m = nights @ 0 0\nbars table: m @ 400 0", "Bars of nights")]);
    const canvas = element.querySelector<HTMLElement>(".wb-canvas")!;
    canvas.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 900, bottom: 600, width: 900, height: 600, toJSON: () => ({}) });
    canvas.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, clientX: 100, clientY: 60 }));
    const search = element.querySelector(".wb-menu input") as HTMLInputElement;
    search.value = "bars";
    search.dispatchEvent(new Event("input"));
    expect(element.querySelector(".wb-menu")?.classList.contains("side")).toBe(true);
    expect(element.querySelector(".wb-menu-seen")?.textContent).toBe("In the examples: Bars of nights.");
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
    const { element, kept } = bench("n = nights @ 0 0", {}, { "": "n = nights from: 2015 @ 0 0\nbars table: n @ 400 0" });
    expect(element.querySelectorAll(".wb-node").length).toBe(2);
    expect(element.querySelector(".wb-status")?.textContent).toContain("As you left it");
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
    const workbench = new Workbench({
      kit: aKit,
      files: new FilesInBrowser(async () => ""),
      examples: [anExample("n = nights\nbars table: n")],
      stillBoard: '<figure class="bp-card">the still</figure>',
      own: { get: () => null, set: () => {} },
      linkTo: String,
      copy: async () => {},
    });
    await settle();
    expect(workbench.element.querySelector(".wb-cards")?.textContent).toBe("the still");
    workbench.wake();
    await settle();
    expect(workbench.element.querySelector(".wb-cards .bp-painting svg")).not.toBeNull();
  });

  it("lights the node a dial of the board turns, and says what it turns", async () => {
    const { element } = bench('where = dial "Place" value: X4 @ 0 0\nn = nights place: where @ 300 0');
    await settle();
    element.querySelector(".wb-board .wb-dial")?.dispatchEvent(new Event("pointerover", { bubbles: true }));
    expect(element.querySelector('.wb-node[data-node="where"]')?.classList.contains("pointed")).toBe(true);
    expect(element.querySelector(".wb-status")?.textContent).toBe("Place turns place of Nights. It is lit on the canvas.");
  });

  it("opens any of the page's blueprints, says what it is about, and Reset goes back to it", () => {
    const nights = anExample("n = nights @ 0 0", "Nights", "The nights alone.");
    const bars = anExample("m = nights @ 0 0\nbars table: m @ 400 0", "Bars of nights", "A bar a year.");
    const { element, opened, kept } = bench([nights, bars]);
    expect(element.querySelector(".wb-about")?.textContent).toBe("Nights The nights alone.");
    (element.querySelector(".wb-examples-button") as HTMLButtonElement).click();
    const buttons = [...element.querySelectorAll<HTMLButtonElement>(".wb-examples li button")];
    expect(buttons.map((button) => [button.querySelector("strong")?.textContent, button.className])).toEqual([["Nights", "current"], ["Bars of nights", ""]]);
    buttons[1]?.click();
    expect([...element.querySelectorAll(".wb-node")].map((node) => node.getAttribute("data-node"))).toEqual(["m", "bars"]);
    expect(element.querySelector(".wb-about")?.textContent).toBe("Bars of nights A bar a year.");
    expect(opened).toEqual([bars]);
    const from = element.querySelector('.wb-node[data-node="m"] input[type="number"]') as HTMLInputElement;
    from.value = "2010";
    from.dispatchEvent(new Event("change"));
    expect(kept.at(-1)).toContain("m = nights from: 2010");
    (element.querySelector('button[title^="Go back"]') as HTMLButtonElement).click();
    expect([...element.querySelectorAll(".wb-node")].map((node) => node.getAttribute("data-node"))).toEqual(["m", "bars"]);
    expect(kept.at(-1)).toBeNull();
  });

  it("opens an example as the reader left it, kept apart from the rest", () => {
    const nights = anExample("n = nights @ 0 0", "Nights");
    const bars = anExample("m = nights @ 0 0", "Bars of nights");
    const { workbench, element } = bench([nights, bars], {}, { "Bars of nights": "m = nights @ 0 0\nbars table: m @ 400 0" });
    expect([...element.querySelectorAll(".wb-node")].map((node) => node.getAttribute("data-node"))).toEqual(["n"]);
    workbench.open(bars);
    expect([...element.querySelectorAll(".wb-node")].map((node) => node.getAttribute("data-node"))).toEqual(["m", "bars"]);
    expect(element.querySelector(".wb-status")?.textContent).toContain("As you left it");
  });

  it("offers no examples when the page has only the one", () => {
    const { element } = bench([anExample("n = nights @ 0 0", "Nights")]);
    expect(element.querySelector(".wb-examples-button")).toBeNull();
  });

  it("says how to use it, where the hands are, and closes", () => {
    const { element } = bench("n = nights @ 0 0");
    (element.querySelector(".wb-help-button") as HTMLButtonElement).click();
    expect(element.querySelector(".wb-help")?.textContent).toContain("Drag from a pin");
    (element.querySelector(".wb-help-close") as HTMLButtonElement).click();
    expect(element.querySelector(".wb-help")).toBeNull();
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
