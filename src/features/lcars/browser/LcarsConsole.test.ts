// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { aKit } from "../../../platform/blueprint/aKit";
import type { Example } from "../../../platform/blueprint/examplesOf";
import type { BenchSetting } from "../../../platform/plugin/Bench";
import { FilesInBrowser } from "../../../platform/workbench/browser/FilesInBrowser";
import { LcarsConsole } from "./LcarsConsole";

const settle = () => new Promise((resolve) => setTimeout(resolve, 5));
const anExample = (text: string, title = "", about = ""): Example => ({ title, slug: title.toLowerCase().replace(/\W+/g, "-"), about, text });

/** A console on the page with a blueprint — or several — what it keeps of each, the reader's own versions it starts with, and what it copies. */
function display(example: string | readonly Example[], more: Partial<BenchSetting> = {}, left: Readonly<Record<string, string>> = {}) {
  const kept: (string | null)[] = [];
  const opened: Example[] = [];
  const copied: string[] = [];
  const examples = typeof example === "string" ? [anExample(example)] : example;
  const console = new LcarsConsole({
    kit: aKit,
    files: new FilesInBrowser(async () => ""),
    examples,
    own: { get: (one) => left[one.title] ?? null, set: (_, text) => kept.push(text) },
    opened: (one) => opened.push(one),
    linkTo: (_, text) => `link:${text}`,
    copy: async (text) => void copied.push(text),
    ...more,
  });
  document.body.replaceChildren(console.element);
  console.wake();
  const element = console.element;
  const module = (id: string) => element.querySelector<HTMLButtonElement>(`.lc-module[data-node="${id}"]`);
  const key = (name: string) => element.querySelector(`.lc-key-${name}`) as HTMLButtonElement;
  const modules = () => [...element.querySelectorAll<HTMLElement>(".lc-module")].map((each) => each.dataset["node"]);
  const status = () => element.querySelector(".lc-status")?.textContent ?? "";
  return { console, element, kept, opened, copied, module, key, modules, status };
}

const press = (element: Element, name: string, extra: KeyboardEventInit = {}) => element.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, ...extra }));
const Pointer = (window.PointerEvent ?? MouseEvent) as typeof MouseEvent;
const point = (target: Element, type: string, x = 0, y = 0) => target.dispatchEvent(new Pointer(type, { bubbles: true, button: 0, clientX: x, clientY: y }));
/** A hand that takes hold of one thing, goes over another, and lets go there. */
const drag = (from: Element, to: Element, x = 300, y = 20) => {
  point(from, "pointerdown");
  point(to, "pointermove", x, y);
  point(to, "pointerup", x, y);
};

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

const NIGHTS = 'place = dial "Station" value: X4\nn = nights place: place\nbars "Nights a year" table: n';

describe("a blueprint on the display of a starship", () => {
  it("is drawn as modules and conduits, laid out by the display, and paints its pictures on the board once it has run", async () => {
    const { element, modules, module } = display(NIGHTS);
    expect(modules()).toEqual(["place", "n", "bars"]);
    expect(element.querySelectorAll(".lc-conduit").length).toBe(2);
    expect(element.querySelector(".lc-flow .lc-deck-said")?.textContent).toBe("3 modules · 2 conduits");
    expect(module("n")?.classList.contains("idle")).toBe(true);
    await settle();
    expect(module("n")?.querySelector(".lc-ins .lc-tab")?.textContent).toBe("place");
    expect(module("n")?.querySelector(".lc-outs .lc-tab")?.textContent).toBe("5");
    expect(module("n")?.querySelector(".lc-said")?.textContent).toBe("5 rows · year, nights");
    expect([...(module("bars")?.querySelectorAll(".lc-row") ?? [])].map((row) => row.textContent)).toEqual(["xyear", "heightnights"]);
    expect(module("place")?.querySelector(".lc-said")?.textContent).toBe("Dial · el Raval");
    expect(element.querySelector(".wb-board figcaption")?.textContent).toBe("Nights a year");
    expect([...element.querySelectorAll(".lc-lights i")].map((light) => light.className)).toEqual(["done", "done", "done"]);
  });

  it("is headed by what the example open is called and is about, and by which of the page's it is", () => {
    const { element, key } = display([anExample("n = nights", "Hot nights", "The nights alone."), anExample("m = nights", "Bars")]);
    expect(element.querySelector(".lc-title")?.textContent).toBe("Hot nights");
    expect(element.querySelector(".lc-about")?.textContent).toBe("The nights alone.");
    expect(element.querySelector(".lc-count")?.textContent).toBe("Blueprint 1 of 2");
    expect(key("examples").querySelector(".lc-key-code")?.textContent).toBe("01-02");
  });

  it("says what a module pressed is, what it takes and what it gives, with a look at it", async () => {
    const { element, module } = display(NIGHTS);
    await settle();
    expect(element.querySelector<HTMLElement>(".lc-query")?.hidden).toBe(true);
    module("n")?.click();
    const query = element.querySelector(".lc-query") as HTMLElement;
    expect(query.hidden).toBe(false);
    expect(module("n")?.getAttribute("aria-pressed")).toBe("true");
    expect(query.querySelector(".lc-query-name")?.textContent).toBe("Nights");
    expect(query.querySelector(".lc-query-summary")?.textContent).toBe("the nights of each year, made up for a test");
    expect(query.querySelector(".lc-query-said")?.textContent).toBe("5 rows · year, nights");
    expect(query.querySelector('.lc-take[data-pin="from"] input[type="number"]')).not.toBeNull();
    expect(query.querySelector('.lc-give[data-pin="table"] .bp-peek-said')?.textContent).toBe("a table: 5 rows · year, nights");
    expect(query.querySelector('.lc-give[data-pin="table"] table')?.textContent).toContain("2004");
  });

  it("says which module a wired input comes from, and goes there when that is pressed", async () => {
    const { element, module } = display(NIGHTS);
    await settle();
    module("n")?.click();
    const from = element.querySelector('.lc-take[data-pin="place"] .lc-from') as HTMLButtonElement;
    expect(from.textContent).toBe("Station");
    expect(element.querySelector('.lc-take[data-pin="place"] select')).toBeNull();
    from.click();
    expect(module("place")?.getAttribute("aria-pressed")).toBe("true");
    expect(element.querySelector(".lc-query-name")?.textContent).toBe("Station");
    expect(element.querySelector(".lc-query-kind")?.textContent).toBe("Dial");
  });

  it("lets go of a module pressed again, or left with Escape", async () => {
    const { element, module } = display(NIGHTS);
    await settle();
    module("n")?.click();
    module("n")?.click();
    expect(element.querySelector<HTMLElement>(".lc-query")?.hidden).toBe(true);
    module("bars")?.click();
    press(module("bars")!, "Escape");
    expect(module("bars")?.getAttribute("aria-pressed")).toBe("false");
  });

  it("runs again when a value is written on the module chosen, and keeps the reader's version, without where anything stands", async () => {
    const { element, module, kept } = display("n = nights\nbars table: n");
    await settle();
    module("n")?.click();
    const from = element.querySelector('.lc-take[data-pin="from"] input[type="number"]') as HTMLInputElement;
    from.value = "2010";
    from.dispatchEvent(new Event("change"));
    await settle();
    expect(element.querySelector(".wb-board svg title")?.textContent).toBe("2010: 10 nights");
    expect(kept.at(-1)).toBe("n = nights from: 2010\nbars table: n");
    expect(element.querySelector('.lc-take[data-pin="from"] input[type="number"]')).toBe(from);
    expect(module("n")?.querySelector(".lc-told")?.textContent).toBe("from2010");
  });

  it("offers what could come after the module chosen, and adds it wired when pressed, chosen in turn", async () => {
    const { element, module, modules, status } = display("n = nights");
    await settle();
    expect(element.querySelector<HTMLElement>(".lc-next")).not.toBeNull();
    module("n")?.click();
    const offered = () => [...element.querySelectorAll<HTMLButtonElement>(".lc-next button")];
    expect(offered().map((pad) => pad.textContent)).toContain("Trend of nights");
    offered().find((pad) => pad.textContent === "Trend of nights")?.click();
    expect(modules()).toEqual(["n", "trend"]);
    expect(element.querySelectorAll(".lc-conduit").length).toBe(1);
    expect(module("trend")?.getAttribute("aria-pressed")).toBe("true");
    expect(status()).toContain("Trend of nights: added");
    await settle();
    expect(offered().map((pad) => pad.textContent)).toContain("On the board: for each ten");
  });

  it("takes the module chosen away, with Remove or with Delete, and brings it back with Undo", async () => {
    const { element, module, modules, key } = display(NIGHTS);
    await settle();
    expect(key("undo").disabled).toBe(true);
    module("bars")?.click();
    (element.querySelector(".lc-remove") as HTMLButtonElement).click();
    expect(modules()).toEqual(["place", "n"]);
    expect(element.querySelector<HTMLElement>(".lc-query")?.hidden).toBe(true);
    key("undo").click();
    expect(modules()).toEqual(["place", "n", "bars"]);
    module("n")?.click();
    press(module("n")!, "Delete");
    expect(modules()).toEqual(["place", "bars"]);
    press(element, "z", { ctrlKey: true });
    expect(modules()).toEqual(["place", "n", "bars"]);
    key("redo").click();
    expect(modules()).toEqual(["place", "bars"]);
  });

  it("does not take a module away for a Delete typed into one of its inputs", async () => {
    const { element, module, modules } = display("n = nights");
    await settle();
    module("n")?.click();
    press(element.querySelector('.lc-take[data-pin="from"] input')!, "Backspace");
    expect(modules()).toEqual(["n"]);
  });

  it("turns a dial on the board, and marks what ran again, which is only what follows the dial", async () => {
    const { element, module } = display(`${NIGHTS}\nother = nights`);
    await settle();
    const ranOf = (id: string) => [...(module(id)?.classList ?? [])].find((name) => name.startsWith("ran-"));
    expect([ranOf("n"), ranOf("other")]).toEqual(["ran-1", "ran-1"]);
    const select = element.querySelector(".wb-dial select") as HTMLSelectElement;
    select.value = "WU";
    select.dispatchEvent(new Event("change"));
    await settle();
    expect([ranOf("n"), ranOf("other")]).toEqual(["ran-0", "ran-1"]);
    expect(element.querySelector('[data-key^="wire:bars.table:"]')?.classList.contains("flow-0")).toBe(true);
    expect(module("place")?.querySelector(".lc-said")?.textContent).toBe("Dial · Badalona");
  });

  it("lets what flows be seen flowing, all the while, until its pad is pressed, and again once it is pressed again", () => {
    const { element, key } = display(NIGHTS);
    expect(element.classList.contains("flowing")).toBe(true);
    expect(key("flow").getAttribute("aria-pressed")).toBe("true");
    key("flow").click();
    expect(element.classList.contains("flowing")).toBe(false);
    expect(key("flow").getAttribute("aria-pressed")).toBe("false");
    key("flow").click();
    expect(element.classList.contains("flowing")).toBe(true);
  });

  it("rests the flow while the display is off the screen, and no longer watches for it once it is stopped", () => {
    const watching: { seen: (entries: { isIntersecting: boolean }[]) => void; over: boolean }[] = [];
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        private readonly held: (typeof watching)[number];
        constructor(seen: (entries: { isIntersecting: boolean }[]) => void) {
          this.held = { seen, over: false };
          watching.push(this.held);
        }
        observe() {}
        disconnect() {
          this.held.over = true;
        }
      },
    );
    const { console, element, key } = display(NIGHTS);
    watching[0]?.seen([{ isIntersecting: false }]);
    expect(element.classList.contains("flowing")).toBe(false);
    expect(key("flow").getAttribute("aria-pressed")).toBe("true");
    watching[0]?.seen([{ isIntersecting: true }]);
    expect(element.classList.contains("flowing")).toBe(true);
    console.stop();
    expect(watching[0]?.over).toBe(true);
  });

  it("puts an input on the board as a dial, when asked beside it", async () => {
    const { element, module, modules } = display("n = nights from: 2010");
    await settle();
    module("n")?.click();
    (element.querySelector('.lc-take[data-pin="from"] .lc-promote') as HTMLButtonElement).click();
    await settle();
    expect(modules()).toEqual(["n", "from"]);
    expect(element.querySelector(".wb-dial-name")?.textContent).toBe("from");
    expect(element.querySelector('.lc-take[data-pin="from"] .lc-from')?.textContent).toBe("from");
  });

  it("lights the module a picture of the board comes from while it is pointed at, and chooses it when its title is pressed", async () => {
    const { element, module } = display(NIGHTS);
    await settle();
    element.querySelector(".wb-board .bp-card svg")?.dispatchEvent(new Event("pointerover", { bubbles: true }));
    expect(module("bars")?.classList.contains("pointed")).toBe(true);
    element.querySelector(".wb-board")?.dispatchEvent(new Event("pointerleave"));
    expect(module("bars")?.classList.contains("pointed")).toBe(false);
    (element.querySelector(".wb-board .wb-find") as HTMLButtonElement).click();
    expect(module("bars")?.getAttribute("aria-pressed")).toBe("true");
  });

  const MANY = [anExample("n = nights", "Hot nights", "The nights alone."), anExample("m = nights\nbars table: m", "Bars"), anExample("x = nights", "Last")];

  it("opens another of the page's examples from the list, and leafs through them round and round", () => {
    const { element, key, modules, opened } = display(MANY);
    key("examples").click();
    expect([...element.querySelectorAll(".wb-examples li strong")].map((title) => title.textContent)).toEqual(["Hot nights", "Bars", "Last"]);
    (element.querySelectorAll(".wb-examples li button")[1] as HTMLButtonElement).click();
    expect(modules()).toEqual(["m", "bars"]);
    expect(element.querySelector(".lc-title")?.textContent).toBe("Bars");
    expect(element.querySelector(".lc-count")?.textContent).toBe("Blueprint 2 of 3");
    expect(element.querySelector(".wb-examples")).toBeNull();
    (element.querySelector(".lc-flip-on") as HTMLButtonElement).click();
    (element.querySelector(".lc-flip-on") as HTMLButtonElement).click();
    expect(modules()).toEqual(["n"]);
    (element.querySelector(".lc-flip-back") as HTMLButtonElement).click();
    expect(modules()).toEqual(["x"]);
    expect(opened.map((example) => example.title)).toEqual(["Bars", "Last", "Hot nights", "Last"]);
  });

  it("offers no list and no leafing where the page writes one blueprint", () => {
    const { element } = display("n = nights");
    expect(element.querySelector(".lc-key-examples")).toBeNull();
    expect(element.querySelector(".lc-flip")).toBeNull();
    expect(element.querySelector(".lc-count")?.textContent).toBe("Blueprint");
  });

  it("starts where a link or the address says, and as the reader left it, and goes back to the page's own with Reset", async () => {
    const [, bars] = MANY;
    const { modules, status, key, kept } = display(MANY, { start: { example: bars!, text: "m = nights", said: "Opened as a link carried it." } });
    expect(modules()).toEqual(["m"]);
    expect(status()).toBe("Opened as a link carried it.");
    key("reset").click();
    expect(modules()).toEqual(["m", "bars"]);
    expect(kept.at(-1)).toBeNull();
    expect(key("reset").disabled).toBe(true);
    const left = display(MANY, {}, { "Hot nights": "n = nights\nbars table: n" });
    expect(left.modules()).toEqual(["n", "bars"]);
    expect(left.status()).toContain("As you left it");
  });

  it("shows a blueprint an agent wrote as an edit, which Undo takes back", () => {
    const { console, modules, key, status } = display("n = nights");
    console.ask("x = nights\nbars table: x");
    expect(modules()).toEqual(["x", "bars"]);
    expect(status()).toBe("Written by an agent. Undo, or Reset, goes back.");
    key("undo").click();
    expect(modules()).toEqual(["n"]);
  });

  it("adds a module of any kind from the menu, chosen once it is there: what it needs is run to it by hand", () => {
    const { element, key, modules, module } = display("n = nights");
    key("add").click();
    const offered = [...element.querySelectorAll<HTMLElement>(".wb-menu [role=option]")].map((item) => item.dataset["kind"]);
    expect(offered).toEqual(expect.arrayContaining(["nights", "your-data", "note", "bars", "dial"]));
    element.querySelector<HTMLElement>('.wb-menu [data-kind="bars"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(modules()).toEqual(["n", "bars"]);
    expect(module("bars")?.getAttribute("aria-pressed")).toBe("true");
  });

  it("shows the blueprint as text, and is the blueprint written there once it is applied", () => {
    const { element, key, modules } = display("n = nights\nbars table: n");
    key("text").click();
    const area = element.querySelector(".wb-text-area") as HTMLTextAreaElement;
    expect(area.value).toBe("n = nights\nbars table: n");
    area.value = "n = nights\nt = trend table: n\nreadout value: t";
    (element.querySelector(".wb-apply") as HTMLButtonElement).click();
    expect(modules()).toEqual(["n", "t", "readout"]);
  });

  it("copies a link to the blueprint as it is now", async () => {
    const { key, copied, status } = display("n = nights from: 2010");
    key("link").click();
    await settle();
    expect(copied).toEqual(["link:nights from: 2010"]);
    expect(status()).toContain("is copied");
  });

  it("takes the whole window when asked, and gives it back with Escape", () => {
    const { element, key } = display("n = nights");
    key("full").click();
    expect(element.classList.contains("full")).toBe(true);
    expect(document.body.classList.contains("lc-full-open")).toBe(true);
    expect(key("full").textContent).toBe("Back to the page");
    press(element, "Escape");
    expect(element.classList.contains("full")).toBe(false);
    expect(document.body.classList.contains("lc-full-open")).toBe(false);
  });

  it("says how it is worked, where the pads are, and puts it away when asked again", () => {
    const { element, key } = display("n = nights");
    key("help").click();
    expect(element.querySelector(".lc-help")?.textContent).toContain("Press a module");
    key("help").click();
    expect(element.querySelector(".lc-help")).toBeNull();
  });

  it("keeps the board the build wrote until the blueprint has run here", async () => {
    const { element } = display(NIGHTS, { stillBoard: '<figure class="bp-card"><figcaption>From the build</figcaption></figure>' });
    expect(element.querySelector(".wb-board figcaption")?.textContent).toBe("From the build");
    await settle();
    expect(element.querySelector(".wb-board figcaption")?.textContent).toBe("Nights a year");
  });

  it("runs nothing more once it is stopped, and gives the window back", async () => {
    const { console, element, key, module } = display("n = nights");
    key("full").click();
    console.stop();
    expect(document.body.classList.contains("lc-full-open")).toBe(false);
    await settle();
    expect(module("n")?.classList.contains("idle")).toBe(true);
    expect(element.querySelector(".lc-lights i")?.className).toBe("idle");
  });
});

describe("a conduit run by hand on the display of a starship", () => {
  const out = (module: Element | null | undefined) => module?.querySelector(".lc-outs .lc-tab") as HTMLElement;
  const keys = (element: Element) => [...element.querySelectorAll<HTMLElement>(".lc-conduit")].map((conduit) => conduit.dataset["key"]);

  it("is run from a module's port to the module it is let go on, into the input that takes it, and that module is chosen", async () => {
    const { element, module, kept, status } = display("n = nights\nbars");
    await settle();
    drag(out(module("n")), module("bars")!);
    expect(keys(element)).toEqual(["wire:bars.table:n.table"]);
    expect(kept.at(-1)).toBe("n = nights\nbars table: n");
    expect(module("bars")?.getAttribute("aria-pressed")).toBe("true");
    expect(status()).toBe("Nights now feeds table of Bars.");
    expect(element.querySelector(".lc-world")?.classList.contains("joining")).toBe(false);
  });

  it("lights what could take it while it is run, draws it out to the hand, and says what letting go there would do", async () => {
    const { element, module, status } = display("n = nights\nbars\nreadout");
    await settle();
    point(out(module("n")), "pointerdown");
    expect(element.querySelector(".lc-world")?.classList.contains("joining")).toBe(false);
    point(module("bars")!, "pointermove", 300, 20);
    expect(element.querySelector(".lc-world")?.classList.contains("joining")).toBe(true);
    expect([module("n")?.classList.contains("feeds"), module("bars")?.classList.contains("takes"), module("bars")?.classList.contains("over"), module("readout")?.classList.contains("takes")]).toEqual([true, true, true, false]);
    expect(element.querySelector(".lc-rubber")?.getAttribute("d")).toMatch(/L300 20$/);
    expect(status()).toBe("Let go to feed table of Bars.");
    point(module("readout")!, "pointermove", 300, 90);
    expect(status()).toBe("Not there: a table cannot go into value, which takes a number.");
    point(element.querySelector(".lc-schematic")!, "pointermove", 500, 200);
    expect(status()).toBe("Let go on a module that is lit to feed it, or where nothing stands for what could come next.");
    point(module("readout")!, "pointerup", 300, 90);
    expect(keys(element)).toEqual([]);
    expect(status()).toBe("Not wired: a table cannot go into value, which takes a number.");
    expect(element.querySelector(".lc-world")?.classList.contains("joining")).toBe(false);
    expect(element.querySelector(".lc-rubber")).toBeNull();
  });

  it("asks which input, where the module it is let go on has several that could take it, and feeds the one answered", async () => {
    const { element, module, key } = display("a = nights\njoin");
    await settle();
    drag(out(module("a")), module("join")!);
    const pads = () => [...element.querySelectorAll<HTMLButtonElement>(".lc-choice button")];
    expect(element.querySelector(".lc-choice p")?.textContent).toBe("Which input of Join does Nights feed?");
    expect(pads().map((pad) => pad.textContent)).toEqual(["leftnothing feeds it yet", "rightnothing feeds it yet"]);
    expect(keys(element)).toEqual([]);
    pads()[1]?.click();
    expect(keys(element)).toEqual(["wire:join.right:a.table"]);
    expect(element.querySelector(".lc-choice")).toBeNull();
    // Run again, it takes the one input nothing feeds yet, without asking.
    key("undo").click();
    key("redo").click();
    drag(out(module("a")), module("join")!);
    expect(element.querySelector(".lc-choice")).toBeNull();
    expect(keys(element)).toEqual(["wire:join.right:a.table", "wire:join.left:a.table"]);
  });

  it("says what feeds an input already, where an answer would take its place, and changes nothing when the question is put away", async () => {
    const { element, module } = display("a = nights\nb = nights\njoin left: a right: a");
    await settle();
    drag(out(module("b")), module("join")!);
    const pads = [...element.querySelectorAll<HTMLButtonElement>(".lc-choice button")];
    expect(pads.map((pad) => pad.textContent)).toEqual(["leftin place of Nights", "rightin place of Nights"]);
    press(pads[0]!, "Escape");
    expect(element.querySelector(".lc-choice")).toBeNull();
    expect(keys(element)).toEqual(["wire:join.left:a.table", "wire:join.right:a.table"]);
  });

  it("feeds the very input the hand lets go on: a port, in place of what fed it, or a line written under the module", async () => {
    const { element, module, kept } = display("a = nights\nb = nights\njoin left: a\nj = join");
    await settle();
    drag(out(module("b")), module("join")!.querySelector('.lc-ins [data-pin="left"]')!);
    expect(keys(element)).toEqual(["wire:join.left:b.table"]);
    drag(out(module("a")), module("j")!.querySelector('.lc-row[data-pin="right"]')!);
    expect(keys(element)).toEqual(["wire:join.left:b.table", "wire:j.right:a.table"]);
    expect(kept.at(-1)).toBe("a = nights\nb = nights\njoin left: b\njoin right: a");
  });

  it("is lifted off the input it feeds by its port there: let go on another module, it feeds that one instead, in one step", async () => {
    const { element, module, key, status } = display("n = nights\nbars table: n\nshow-table");
    await settle();
    const fed = () => module("bars")?.querySelector('.lc-ins [data-pin="table"]') as HTMLElement;
    point(fed(), "pointerdown");
    point(module("show-table")!, "pointermove", 300, 90);
    expect(element.querySelector('[data-key="wire:bars.table:n.table"]')?.classList.contains("lifted")).toBe(true);
    expect([module("n")?.classList.contains("feeds"), module("bars")?.classList.contains("takes")]).toEqual([true, true]);
    point(module("show-table")!, "pointerup", 300, 90);
    expect(keys(element)).toEqual(["wire:show-table.table:n.table"]);
    expect(status()).toBe("Nights now feeds table of Table.");
    key("undo").click();
    expect(keys(element)).toEqual(["wire:bars.table:n.table"]);
  });

  it("is taken out when it is lifted and let go where nothing stands, and left as it was when let go where it was", async () => {
    const { element, module, status } = display("n = nights\nbars table: n");
    await settle();
    const fed = () => module("bars")?.querySelector('.lc-ins [data-pin="table"]') as HTMLElement;
    drag(fed(), module("bars")!);
    expect(keys(element)).toEqual(["wire:bars.table:n.table"]);
    drag(fed(), element.querySelector(".lc-schematic")!);
    expect(keys(element)).toEqual([]);
    expect(status()).toBe("Conduit taken out. Undo brings it back.");
  });

  it("offers what could take it where it is let go on nothing, and adds the one chosen already fed, as one step", async () => {
    const { element, module, modules, key } = display("n = nights");
    await settle();
    drag(out(module("n")), element.querySelector(".lc-schematic")!);
    const offered = [...element.querySelectorAll<HTMLElement>(".wb-menu [role=option]")].map((item) => item.dataset["kind"]);
    expect(offered).toEqual(expect.arrayContaining(["bars", "keep"]));
    expect(offered).not.toContain("nights");
    element.querySelector<HTMLElement>('.wb-menu [data-kind="bars"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(modules()).toEqual(["n", "bars"]);
    expect(keys(element)).toEqual(["wire:bars.table:n.table"]);
    expect(module("bars")?.getAttribute("aria-pressed")).toBe("true");
    key("undo").click();
    expect([modules(), keys(element)]).toEqual([["n"], []]);
  });

  it("leaves a press that goes nowhere a press, and does not take the press that ends a drag for one", async () => {
    const { element, module } = display("n = nights\nbars");
    await settle();
    point(out(module("n")), "pointerdown");
    point(out(module("n")), "pointerup");
    module("n")?.click();
    expect(module("n")?.getAttribute("aria-pressed")).toBe("true");
    drag(out(module("n")), module("bars")!);
    // A browser sends a click where a drag ends, to whatever holds both ends of it.
    element.querySelector<HTMLElement>(".lc-schematic")?.click();
    expect(module("bars")?.getAttribute("aria-pressed")).toBe("true");
  });

  it("is run pad by pad too: Feed beside an output, then the module pressed; Escape, or Feed again, lets it go", async () => {
    const { element, module, status } = display("n = nights\nbars");
    await settle();
    module("n")?.click();
    const feed = () => element.querySelector('.lc-give[data-pin="table"] .lc-feed') as HTMLButtonElement;
    const joining = () => element.querySelector(".lc-world")?.classList.contains("joining");
    feed().click();
    expect([joining(), feed().getAttribute("aria-pressed"), module("bars")?.classList.contains("takes")]).toEqual([true, "true", true]);
    expect(status()).toBe("Press the module it should feed: those that can take it are lit. Escape lets it go.");
    expect(element.querySelector(".lc-rubber")).toBeNull();
    press(element, "Escape");
    expect([joining(), module("n")?.getAttribute("aria-pressed")]).toEqual([false, "true"]);
    feed().click();
    feed().click();
    expect(joining()).toBe(false);
    feed().click();
    module("bars")?.click();
    expect(keys(element)).toEqual(["wire:bars.table:n.table"]);
    expect([joining(), module("bars")?.getAttribute("aria-pressed")]).toEqual([false, "true"]);
  });

  it("is taken out by the pad beside the input it feeds", async () => {
    const { element, module, kept, status } = display(NIGHTS);
    await settle();
    module("n")?.click();
    (element.querySelector('.lc-take[data-pin="place"] .lc-cut') as HTMLButtonElement).click();
    expect(keys(element)).toEqual(["wire:bars.table:n.table"]);
    expect(kept.at(-1)).toBe('dial "Station" value: X4\nn = nights\nbars "Nights a year" table: n');
    expect(status()).toBe("Conduit taken out. Undo brings it back.");
  });

  it("is let go of when the hand is called away", async () => {
    const { element, module } = display("n = nights\nbars");
    await settle();
    point(out(module("n")), "pointerdown");
    point(module("bars")!, "pointermove", 300, 20);
    point(module("bars")!, "pointercancel", 300, 20);
    expect(element.querySelector(".lc-world")?.classList.contains("joining")).toBe(false);
    point(module("bars")!, "pointerup", 300, 20);
    expect(keys(element)).toEqual([]);
  });
});

describe("a module moved by hand on the display of a starship", () => {
  const FAN = "n = nights\nbars table: n\nshow-table table: n";
  /** A hand that takes a module by its name and carries it so far down, or up. */
  const carry = (module: Element | null | undefined, by: number, type = "mouse") => {
    const name = module?.querySelector(".lc-name") as HTMLElement;
    name.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, clientX: 200, clientY: 10, pointerType: type }));
    point(document.body, "pointermove", 200, 10 + by);
    return () => point(document.body, "pointerup", 200, 10 + by);
  };

  it("is carried down its column onto another row, changes places with what stood there, and stays there", async () => {
    const { element, module, status } = display(FAN);
    await settle();
    const top = (id: string) => Number.parseFloat(module(id)?.style.top ?? "");
    const under = top("show-table");
    expect([top("bars"), under > 0]).toEqual([0, true]);
    const letGo = carry(module("bars"), under);
    expect(module("bars")?.classList.contains("moving")).toBe(true);
    expect(element.querySelector(".lc-slot")).not.toBeNull();
    expect(top("show-table")).toBe(0);
    expect(status()).toBe("Let go to stand it on this row. A module keeps its column: the flow says which.");
    letGo();
    expect([top("show-table"), top("bars") > 0]).toEqual([0, true]);
    expect([module("bars")?.classList.contains("moving"), module("bars")?.style.transform, element.querySelector(".lc-slot")]).toEqual([false, "", null]);
    expect(status()).toBe("Moved: everything else stays where it stood. Tidy hands the layout back to the display.");
  });

  it("is one step, which Undo takes back, and Tidy hands the layout back to the display", async () => {
    const { module, key } = display(FAN);
    await settle();
    const top = (id: string) => Number.parseFloat(module(id)?.style.top ?? "");
    expect(key("tidy").disabled).toBe(true);
    carry(module("bars"), top("show-table"))();
    expect([top("show-table"), key("tidy").disabled]).toEqual([0, false]);
    key("undo").click();
    expect([top("bars"), key("tidy").disabled]).toEqual([0, true]);
    key("redo").click();
    expect(top("show-table")).toBe(0);
    key("tidy").click();
    expect([top("bars"), key("tidy").disabled]).toEqual([0, true]);
    key("undo").click();
    expect(top("show-table")).toBe(0);
  });

  it("stays where it was put through what is done after, until Reset, and is not what another blueprint is told", async () => {
    const { element, module, key } = display([anExample(FAN, "Fan"), anExample(FAN, "Another")]);
    await settle();
    const top = (id: string) => Number.parseFloat(module(id)?.style.top ?? "");
    carry(module("bars"), top("show-table"))();
    await settle();
    module("n")?.click();
    const from = element.querySelector('.lc-take[data-pin="from"] input') as HTMLInputElement;
    from.value = "2010";
    from.dispatchEvent(new Event("change"));
    await settle();
    expect(top("show-table")).toBe(0);
    (element.querySelector(".lc-flip-on") as HTMLButtonElement).click();
    expect(top("bars")).toBe(0);
    (element.querySelector(".lc-flip-back") as HTMLButtonElement).click();
    key("reset").click();
    expect(top("bars")).toBe(0);
  });

  it("is left where it stood when it is let go on its own row, or the hand is called away, and a press is still a press", async () => {
    const { module, key } = display(FAN);
    await settle();
    const top = (id: string) => Number.parseFloat(module(id)?.style.top ?? "");
    carry(module("bars"), 12)();
    expect([top("bars"), key("undo").disabled]).toEqual([0, true]);
    carry(module("bars"), top("show-table"));
    point(document.body, "pointercancel");
    expect([top("bars"), module("bars")?.classList.contains("moving")]).toEqual([0, false]);
    carry(module("bars"), 2)();
    module("bars")?.click();
    expect(module("bars")?.getAttribute("aria-pressed")).toBe("true");
  });

  it("is not carried by a finger, which moves the page", async () => {
    const { module } = display(FAN);
    await settle();
    carry(module("bars"), 90, "touch");
    expect(module("bars")?.classList.contains("moving")).toBe(false);
  });

  it("goes a row down, or up, when it is the one chosen and Alt is held with an arrow", async () => {
    const { element, module } = display(FAN);
    await settle();
    const top = (id: string) => Number.parseFloat(module(id)?.style.top ?? "");
    module("bars")?.click();
    press(element, "ArrowDown", { altKey: true });
    expect(top("show-table")).toBe(0);
    press(element, "ArrowUp", { altKey: true });
    expect(top("bars")).toBe(0);
    press(element, "ArrowDown");
    expect(top("bars")).toBe(0);
  });
});
