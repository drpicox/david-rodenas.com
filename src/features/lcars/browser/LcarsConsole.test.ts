// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
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

afterEach(() => document.body.replaceChildren());

const NIGHTS = 'place = dial "Station" value: X4\nn = nights place: place\nbars "Nights a year" table: n';

describe("a blueprint on the display of a starship", () => {
  it("is drawn as modules and conduits, laid out by the display, and paints its pictures on the board once it has run", async () => {
    const { element, modules, module } = display(NIGHTS);
    expect(modules()).toEqual(["place", "n", "bars"]);
    expect(element.querySelectorAll(".lc-conduit").length).toBe(2);
    expect(element.querySelector(".lc-flow .lc-deck-said")?.textContent).toBe("3 modules · 2 conduits");
    expect(module("n")?.classList.contains("idle")).toBe(true);
    await settle();
    expect(module("n")?.querySelector(".lc-code")?.textContent).toBe("5");
    expect(module("n")?.querySelector(".lc-said")?.textContent).toBe("5 rows · year, nights");
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
    expect(element.querySelector('[data-key="wire:bars.table"]')?.classList.contains("flow-0")).toBe(true);
    expect(module("place")?.querySelector(".lc-said")?.textContent).toBe("Dial · Badalona");
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

  it("adds a module that needs nothing wired into it from the menu, and never offers one that does", () => {
    const { element, key, modules, module } = display("n = nights");
    key("add").click();
    const offered = [...element.querySelectorAll<HTMLElement>(".wb-menu [role=option]")].map((item) => item.dataset["kind"]);
    expect(offered).toEqual(expect.arrayContaining(["nights", "your-data", "note"]));
    expect(offered).not.toContain("bars");
    expect(offered).not.toContain("dial");
    element.querySelector<HTMLElement>('.wb-menu [data-kind="nights"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(modules()).toEqual(["n", "nights"]);
    expect(module("nights")?.getAttribute("aria-pressed")).toBe("true");
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
