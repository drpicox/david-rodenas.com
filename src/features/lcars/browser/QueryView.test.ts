// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { aKit } from "../../../platform/blueprint/aKit";
import { evaluateBlueprint } from "../../../platform/blueprint/evaluateBlueprint";
import { parseBlueprint } from "../../../platform/blueprint/parseBlueprint";
import { resolvedEditor } from "../../../platform/blueprint/resolvedEditor";
import { type QueryShown, QueryView } from "./QueryView";

const read = () => "";

/** A query, what it was asked to do, and how to show it a node of a blueprint, run. */
function query(text: string) {
  const asked: unknown[][] = [];
  const view = new QueryView(aKit, {
    write: (...said) => asked.push(["write", ...said]),
    promote: (...said) => asked.push(["promote", ...said]),
    go: (...said) => asked.push(["go", ...said]),
    follow: (...said) => asked.push(["follow", ...said]),
    remove: (...said) => asked.push(["remove", ...said]),
    feed: (...said) => asked.push(["feed", ...said]),
    cut: (...said) => asked.push(["cut", ...said]),
  });
  const shown = (id: string, written = text, more: Partial<QueryShown> = {}): QueryShown => {
    const { blueprint } = parseBlueprint(written, aKit);
    const evaluation = evaluateBlueprint(blueprint, aKit, { read });
    const node = blueprint.nodes.find((each) => each.id === id)!;
    const editors = new Map((aKit.kinds.get(node.kind)?.inputs ?? []).map((pin) => [pin.name, resolvedEditor(node, pin, aKit, read, evaluation)]));
    return { node, result: evaluation.get(id), from: new Map(), editors, next: [], ...more };
  };
  const take = (pin: string) => view.element.querySelector(`.lc-take[data-pin="${pin}"]`) as HTMLElement;
  return { view, asked, shown, take, element: view.element };
}

describe("a module of the schematic, asked what it is", () => {
  it("is put away until one is chosen, and then says its name, its kind where it has a name of its own, what it does and what came out of it", () => {
    const { view, element, shown } = query('n = nights "Hot nights"');
    expect(element.hidden).toBe(true);
    view.show(shown("n"));
    expect(element.hidden).toBe(false);
    expect(element.querySelector(".lc-query-name")?.textContent).toBe("Hot nights");
    expect(element.querySelector(".lc-query-kind")?.textContent).toBe("Nights");
    expect(element.querySelector(".lc-query-summary")?.textContent).toBe("the nights of each year, made up for a test");
    expect(element.querySelector(".lc-query-said")?.textContent).toBe("5 rows · year, nights");
    view.show(null);
    expect(element.hidden).toBe(true);
  });

  it("says in red what a module in trouble lacks, and what the holder knows better than the module does", () => {
    const { view, element, shown } = query("bars");
    view.show(shown("bars"));
    expect(element.querySelector(".lc-query-said")?.textContent).toBe("wire or write: table");
    expect(element.querySelector(".lc-query-said")?.classList.contains("trouble")).toBe(true);
    view.show(shown("bars", "bars", { said: "on the board: el Raval" }));
    expect(element.querySelector(".lc-query-said")?.textContent).toBe("on the board: el Raval");
  });

  it("has a control for each input, as its kind asks for it to be written, and tells what is written there", () => {
    const { view, asked, shown, take } = query("n = nights");
    view.show(shown("n"));
    const from = take("from").querySelector('input[type="number"]') as HTMLInputElement;
    expect(from.placeholder).toBe("2000");
    from.value = "2010";
    from.dispatchEvent(new Event("change"));
    const place = take("place").querySelector("select") as HTMLSelectElement;
    expect([...place.options].map((option) => option.textContent)).toEqual(["Badalona", "el Raval"]);
    place.value = "X4";
    place.dispatchEvent(new Event("change"));
    expect(asked).toEqual([
      ["write", "n", "from", 2010, true],
      ["write", "n", "place", "X4", true],
    ]);
  });

  it("keeps a control a hand may be in when only its value changed, and builds the rows again for another module", () => {
    const { view, shown, take } = query("n = nights\nm = nights");
    view.show(shown("n"));
    const place = take("place").querySelector("select");
    view.show(shown("n", "n = nights place: X4"));
    expect(take("place").querySelector("select")).toBe(place);
    expect(place?.value).toBe("X4");
    view.show(shown("m", "n = nights\nm = nights"));
    expect(take("place").querySelector("select")).not.toBe(place);
  });

  it("says where a wired input comes from instead, as a pad that goes there, and writes it by hand again once the wire is gone", () => {
    const { view, asked, shown, take } = query("n = nights");
    view.show(shown("n", "n = nights", { from: new Map([["place", { node: "station", said: "Station" }]]) }));
    expect(take("place").classList.contains("wired")).toBe(true);
    expect(take("place").querySelector("select")).toBeNull();
    const go = take("place").querySelector(".lc-from") as HTMLButtonElement;
    expect(go.textContent).toBe("Station");
    go.click();
    expect(asked).toEqual([["go", "station"]]);
    view.show(shown("n"));
    expect(take("place").classList.contains("wired")).toBe(false);
    expect(take("place").querySelector("select")).not.toBeNull();
  });

  it("asks for the conduit into a wired input to be taken out, beside where it comes from", () => {
    const { view, asked, shown, take } = query("n = nights");
    view.show(shown("n", "n = nights", { from: new Map([["place", { node: "station", said: "Station" }]]) }));
    const cut = take("place").querySelector(".lc-cut") as HTMLButtonElement;
    expect(cut.getAttribute("aria-label")).toBe("Take out the conduit into place");
    cut.click();
    expect(asked).toEqual([["cut", "n", "place"]]);
    expect(take("from").querySelector(".lc-cut")).toBeNull();
  });

  it("offers to put on the board what a dial can stand for, and nothing wired, nor a table", () => {
    const { view, asked, shown, take } = query("n = nights\nbars table: n");
    view.show(shown("n"));
    (take("from").querySelector(".lc-promote") as HTMLButtonElement).click();
    expect(asked).toEqual([["promote", "n", "from"]]);
    view.show(shown("bars", "n = nights\nbars table: n", { from: new Map([["table", { node: "n", said: "Nights" }]]) }));
    expect(take("table").querySelector(".lc-promote")).toBeNull();
    expect(take("x").querySelector(".lc-promote")).not.toBeNull();
  });

  it("shows what each output gives, with a look at it: a table's first rows, a number as it is; and nothing for a module that only paints", () => {
    const { view, element, shown } = query("n = nights\nt = trend table: n y: nights\nbars table: n");
    view.show(shown("n"));
    expect(element.querySelector('.lc-give[data-pin="table"] .bp-peek-said')?.textContent).toBe("a table: 5 rows · year, nights");
    expect(element.querySelector('.lc-give[data-pin="table"] table')?.textContent).toContain("2004");
    view.show(shown("t"));
    expect([...element.querySelectorAll(".lc-give .bp-peek-said")].map((said) => said.textContent)[0]).toBe("a number: 20");
    view.show(shown("bars"));
    expect(element.querySelector<HTMLElement>(".lc-gives")?.hidden).toBe(true);
  });

  it("offers to run a conduit from each output, tells which was asked for, and says which is being run while one is", () => {
    const TREND = "n = nights\nt = trend table: n y: nights";
    const { view, element, asked, shown } = query(TREND);
    view.show(shown("t"));
    const feed = (pin: string) => element.querySelector(`.lc-give[data-pin="${pin}"] .lc-feed`) as HTMLButtonElement;
    expect([feed("slope").textContent, feed("slope").getAttribute("aria-pressed")]).toEqual(["Feed", "false"]);
    feed("slope").click();
    expect(asked).toEqual([["feed", "t", "slope"]]);
    view.show(shown("t", TREND, { feeding: "slope" }));
    expect([feed("slope").getAttribute("aria-pressed"), feed("per-ten").getAttribute("aria-pressed")]).toEqual(["true", "false"]);
  });

  it("says a module has not run yet where it has nothing to show", () => {
    const { view, element, shown } = query("n = nights");
    view.show({ ...shown("n"), result: undefined });
    expect(element.querySelector(".lc-give .bp-peek-said")?.textContent).toBe("It has not run yet.");
  });

  it("offers what could come next as pads, tells which was pressed by what it says, and builds them again only when what is offered changes", () => {
    const { view, element, asked, shown } = query("n = nights");
    const next = [
      { label: "Trend of nights", kind: "trend" },
      { label: "Show the table", kind: "show-table" },
    ];
    view.show(shown("n"));
    expect(element.querySelector<HTMLElement>(".lc-next")?.hidden).toBe(true);
    view.show(shown("n", "n = nights", { next }));
    const pads = [...element.querySelectorAll<HTMLButtonElement>(".lc-next button")];
    expect(pads.map((pad) => [pad.textContent, pad.title])).toEqual([
      ["Trend of nights", "Add it, wired from this module: Trend"],
      ["Show the table", "Add it, wired from this module: Table"],
    ]);
    view.show(shown("n", "n = nights from: 2010", { next }));
    expect([...element.querySelectorAll(".lc-next button")]).toEqual(pads);
    pads[0]?.click();
    expect(asked).toEqual([["follow", "n", "Trend of nights"]]);
    view.show(shown("n", "n = nights", { next: next.slice(1) }));
    expect(element.querySelectorAll(".lc-next button").length).toBe(1);
  });

  it("asks for the module chosen to be taken away", () => {
    const { view, element, asked, shown } = query("n = nights");
    view.show(shown("n"));
    (element.querySelector(".lc-remove") as HTMLButtonElement).click();
    expect(asked).toEqual([["remove", "n"]]);
  });
});
