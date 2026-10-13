import { describe, expect, it } from "vitest";
import { aKit } from "../blueprint/aKit";
import type { Example } from "../blueprint/examplesOf";
import { Pending } from "../blueprint/Pending";
import type { BenchSetting } from "../plugin/Bench";
import { OpenBlueprint } from "./OpenBlueprint";

const settle = () => new Promise((resolve) => setTimeout(resolve, 5));
const anExample = (text: string, title = ""): Example => ({ title, slug: title.toLowerCase(), about: "", text });
const ids = (open: OpenBlueprint) => open.now.nodes.map((node) => node.id);

/** A blueprint open nowhere in particular: what it keeps, what it tells, and how often it asks to be drawn again. */
function opened(example: string | readonly Example[], more: Partial<BenchSetting> = {}, left: Readonly<Record<string, string>> = {}, kept: { positions: boolean } = { positions: false }) {
  const told: (string | null)[] = [];
  const shown: Example[] = [];
  let drawn = 0;
  const examples = typeof example === "string" ? [anExample(example)] : example;
  const open = new OpenBlueprint(
    { kit: aKit, files: { read: () => "", listen: () => () => {} }, examples, own: { get: (one) => left[one.title] ?? null, set: (_, text) => told.push(text) }, opened: (one) => shown.push(one), linkTo: (_, text) => `link:${text}`, copy: async () => {}, ...more },
    () => (drawn += 1),
    kept,
  );
  return { open, told, shown, drawn: () => drawn };
}

const MANY = [anExample("n = nights", "Hot nights"), anExample("m = nights\nbars table: m", "Bars")];

describe("a blueprint open at a bench", () => {
  it("is the page's first, or the one it is told to start on, as a link carried it or as the reader left it", () => {
    expect(ids(opened(MANY).open)).toEqual(["n"]);
    const linked = opened(MANY, { start: { example: MANY[1]!, text: "x = nights", said: "Opened as a link carried it." } }).open;
    expect([linked.example.title, ids(linked), linked.notice]).toEqual(["Bars", ["x"], "Opened as a link carried it."]);
    const left = opened(MANY, {}, { "Hot nights": "n = nights\nbars table: n" }).open;
    expect(ids(left)).toEqual(["n", "bars"]);
    expect(left.notice).toContain("As you left it");
    expect(left.own).toBe(true);
  });

  it("shows the board the build wrote only for the page's first blueprint, as the page wrote it", () => {
    const still = { stillBoard: "<figure></figure>" };
    expect(opened(MANY, still).open.still).toBe("<figure></figure>");
    expect(opened(MANY, { ...still, start: { example: MANY[1]! } }).open.still).toBeUndefined();
    expect(opened(MANY, still, { "Hot nights": "n = nights" }).open.still).toBeUndefined();
  });

  it("keeps the reader's version after every edit, with where its nodes stand only where that is asked, and forgets it once it is the page's own again", () => {
    const { open, told } = opened("n = nights");
    open.write("n", "from", 2010, true);
    expect(told.at(-1)).toBe("nights from: 2010");
    expect(open.own).toBe(true);
    open.undo();
    expect(told.at(-1)).toBeNull();
    expect(open.own).toBe(false);
    const placed = opened("n = nights", {}, {}, { positions: true });
    placed.open.write("n", "from", 2010, true);
    expect(placed.told.at(-1)).toMatch(/^nights from: 2010 @ \d+ \d+$/);
  });

  it("steps back and forward through its edits, a value typed in one go being one step, and goes back to the page's own", () => {
    const { open } = opened("n = nights");
    expect([open.canUndo, open.canRedo]).toEqual([false, false]);
    open.write("n", "from", 201, false);
    open.write("n", "from", 2010, false);
    open.write("n", "place", "X4", true);
    expect(open.now.nodes[0]?.values).toEqual({ from: 2010, place: "X4" });
    open.undo();
    expect(open.now.nodes[0]?.values).toEqual({ from: 2010 });
    open.undo();
    expect(open.now.nodes[0]?.values).toEqual({});
    open.redo();
    expect(open.now.nodes[0]?.values).toEqual({ from: 2010 });
    open.reset();
    expect([open.now.nodes[0]?.values, open.own, open.notice]).toEqual([{}, false, "Back to the blueprint as the page wrote it."]);
    open.undo();
    expect(open.now.nodes[0]?.values).toEqual({ from: 2010 });
  });

  it("runs only once it is awake, soon after an edit, and asks to be drawn again each time", async () => {
    const { open, drawn } = opened("n = nights\nbars table: n");
    await settle();
    expect(open.evaluation.size).toBe(0);
    open.wake();
    await settle();
    expect(open.evaluation.get("bars")?.state).toBe("done");
    expect(open.ran).toBe(true);
    const before = drawn();
    open.write("n", "from", 2010, true);
    expect(drawn()).toBe(before + 1);
    await settle();
    expect(drawn()).toBe(before + 2);
  });

  it("counts how many times each node has run, which is only when what it is handed changed", async () => {
    const { open } = opened("n = nights\nbars table: n\nother = nights");
    open.wake();
    await settle();
    expect(Object.fromEntries(open.runs)).toEqual({ n: 1, bars: 1, other: 1 });
    open.write("n", "from", 2010, true);
    await settle();
    expect(Object.fromEntries(open.runs)).toEqual({ n: 2, bars: 2, other: 1 });
  });

  it("waits for a file on its way, and runs again when it arrives", async () => {
    let here = false;
    let arrived = () => {};
    const waiting = { ...(aKit.kinds.get("nights") as NonNullable<ReturnType<typeof aKit.kinds.get>>), name: "far", run: (_: unknown, { read }: { read(path: string): string }) => ({ said: read("/data/far.json") }) };
    const kit = { kinds: new Map([...aKit.kinds, ["far", waiting]]), types: aKit.types };
    const files = {
      read: (path: string) => {
        if (!here) throw new Pending(path);
        return "arrived";
      },
      listen: (listener: () => void) => {
        arrived = listener;
        return () => {};
      },
    };
    const { open } = opened("far", { kit, files });
    open.wake();
    await settle();
    expect([open.evaluation.get("far")?.state, open.ran]).toEqual(["waiting", false]);
    here = true;
    arrived();
    await settle();
    expect(open.evaluation.get("far")).toMatchObject({ state: "done", said: "arrived" });
    expect(open.ran).toBe(true);
  });

  it("opens another of the page's blueprints: its own history and runs, the reader's version of it, and the address told", async () => {
    const { open, shown } = opened(MANY, {}, { Bars: "m = nights" });
    open.wake();
    open.write("n", "from", 2010, true);
    await settle();
    expect(open.open(MANY[1]!)).toBe(true);
    expect([ids(open), open.canUndo, open.evaluation.size, open.notice]).toEqual([["m"], false, 0, expect.stringContaining("As you left it")]);
    expect(shown).toEqual([MANY[1]]);
    expect(open.open(MANY[1]!)).toBe(false);
    open.open(MANY[0]!);
    expect(open.notice).toBe("Opened here: Hot nights");
    await settle();
    expect(Object.fromEntries(open.runs)).toEqual({ n: 1 });
  });

  it("takes a blueprint an agent wrote as an edit that can be undone", () => {
    const { open } = opened("n = nights");
    open.ask("x = nights\nbars table: x");
    expect([ids(open), open.notice]).toEqual([["x", "bars"], "Written by an agent. Undo, or Reset, goes back."]);
    open.undo();
    expect(ids(open)).toEqual(["n"]);
  });

  it("adds a node of a kind under a name no other has, where the bench says, and says what it is called", () => {
    const { open } = opened("nights");
    expect(open.add("nights", { x: 12, y: 34 })).toBe("nights-2");
    expect(open.now.nodes.at(-1)).toEqual({ id: "nights-2", kind: "nights", x: 12, y: 34, values: {} });
  });

  it("adds a node with one of its inputs fed at once from an output there is, as the one step Undo takes back", () => {
    const { open } = opened("n = nights");
    expect(open.add("bars", { x: 0, y: 0 }, { pin: "table", from: { node: "n", pin: "table" } })).toBe("bars");
    expect(open.now.wires).toEqual([{ from: { node: "n", pin: "table" }, to: { node: "bars", pin: "table" } }]);
    open.undo();
    expect([ids(open), open.now.wires]).toEqual([["n"], []]);
  });

  it("takes a next step, and puts an input on the board, saying what was added", () => {
    const { open } = opened("n = nights from: 2010");
    const added = open.follow("n", { label: "Trend of nights", kind: "trend", from: "table", into: "table", values: { y: "nights" } }, { x: 300, y: 40 });
    expect([added, open.now.nodes.at(-1)]).toEqual(["trend", { id: "trend", kind: "trend", x: 300, y: 40, values: { y: "nights" } }]);
    expect(open.promote("n", "from", { x: 0, y: 0 })).toBe("from");
    expect(open.now.wires.at(-1)).toEqual({ from: { node: "from", pin: "value" }, to: { node: "n", pin: "from" } });
    expect(open.promote("n", "nothing", { x: 0, y: 0 })).toBeNull();
  });

  it("says what its board holds, how each input is written, and what could come next, once it has run", async () => {
    const { open } = opened('place = dial "Station" value: X4\nn = nights place: place\nbars "Nights a year" table: n');
    open.wake();
    await settle();
    expect(open.dials().map((dial) => [dial.label, dial.said])).toEqual([["Station", "el Raval"]]);
    expect(open.cards().map((card) => [card.title, card.painting?.caption])).toEqual([["Nights a year", "nights by year, 5 bars"]]);
    expect(open.editorsOf(open.now.nodes[1]!).get("from")).toMatchObject({ kind: "number", min: 1990 });
    expect(open.nextFor("n").map((offer) => offer.label)).toContain("Trend of nights");
  });

  it("offers a kind on trial, among what could come next, only while its flag is on", async () => {
    const trial = { ...(aKit.kinds.get("trend") as NonNullable<ReturnType<typeof aKit.kinds.get>>), flag: "recipes" };
    const kit = { kinds: new Map([...aKit.kinds, ["trend", trial]]), types: aKit.types };
    const offered = async (isOn?: (flag: string) => boolean) => {
      const { open } = opened("n = nights", { kit, ...(isOn && { isOn }) });
      open.wake();
      await settle();
      return [open.offers(trial), open.nextFor("n").some((offer) => offer.kind === "trend")];
    };
    expect(await offered()).toEqual([false, false]);
    expect(await offered((flag) => flag === "recipes")).toEqual([true, true]);
  });

  it("is written as text, and linked to, as it now is: the link saying where its nodes stand only for a bench that places them", () => {
    const { open } = opened("n = nights\nbars table: n");
    open.write("n", "from", 2010, true);
    expect(open.text()).toBe("n = nights from: 2010\nbars table: n");
    expect(open.link()).toBe("link:n = nights from: 2010\nbars table: n");
    expect(opened("n = nights\nbars table: n", {}, {}, { positions: true }).open.link()).toMatch(/^link:n = nights @ \d+ \d+\nbars table: n @ \d+ \d+$/);
  });

  it("runs nothing more once it is stopped, and no longer listens for files", async () => {
    let listening = true;
    const { open } = opened("n = nights", { files: { read: () => "", listen: () => () => void (listening = false) } });
    open.wake();
    open.stop();
    await settle();
    expect([open.evaluation.size, listening]).toEqual([0, false]);
  });
});
