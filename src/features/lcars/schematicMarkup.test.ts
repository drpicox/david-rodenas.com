import { describe, expect, it } from "vitest";
import { aKit } from "../../platform/blueprint/aKit";
import { evaluateBlueprint } from "../../platform/blueprint/evaluateBlueprint";
import { parseBlueprint } from "../../platform/blueprint/parseBlueprint";
import { SCHEMATIC } from "./SCHEMATIC";
import { schematicMarkup, type SchematicShown } from "./schematicMarkup";

const TEXT = 'place = dial "Station" value: X4\nn = nights place: place\nwhole = keep "Only some" table: n column: year is: at-least value: 2002\nbars "Nights a year" table: whole';
const drawn = (text = TEXT, more: Partial<SchematicShown> = {}, run = true) => {
  const { blueprint } = parseBlueprint(text, aKit);
  return schematicMarkup({ blueprint, kit: aKit, evaluation: run ? evaluateBlueprint(blueprint, aKit, { read: () => "" }) : new Map(), ...more });
};
/** The opening tag of a module, and all of it. */
const moduleOf = (html: string, id: string) => new RegExp(`<button[^>]*data-node="${id}"[^>]*>.*?</button>`).exec(html)?.[0] ?? "";
const classOf = (markup: string) => /class="([^"]*)"/.exec(markup)?.[1]?.split(" ") ?? [];
/** How wide a module is: with a port in, with one out. */
const wide = (ins: boolean, outs: boolean) => SCHEMATIC.name + (ins ? SCHEMATIC.tab + SCHEMATIC.seam : 0) + (outs ? SCHEMATIC.seam + SCHEMATIC.out : 0);

describe("a schematic, as markup", () => {
  const html = drawn();

  it("draws a module for every node, read as the data flows: the port it is fed at, its name, and the port it feeds from, carrying its figure", () => {
    expect(html.match(/<button/g)?.length).toBe(4);
    expect(moduleOf(html, "n")).toContain(
      '<span class="lc-pad"><span class="lc-ins"><i class="lc-tab" data-pin="place" style="--pin: var(--bp-value)">place</i></span><span class="lc-name"><b>Nights</b></span><span class="lc-outs"><i class="lc-tab lc-figure" data-pin="table" style="--pin: var(--bp-table)">5</i></span></span>',
    );
    expect(moduleOf(html, "n")).toContain('title="the nights of each year, made up for a test"');
  });

  it("says which output a conduit leaves from, where a module gives several, in place of its figure", () => {
    expect(moduleOf(drawn("n = nights\nt = trend table: n\nreadout value: t"), "t")).toContain('<span class="lc-outs"><i class="lc-tab" data-pin="per-ten" style="--pin: var(--bp-number)">for each ten</i></span>');
  });

  it("has no port in for a module nothing feeds, and none out for one that only paints", () => {
    expect(moduleOf(html, "place")).toContain('<span class="lc-pad"><span class="lc-name"><b>Station</b></span><span class="lc-outs"><i class="lc-tab lc-figure" data-pin="value" style="--pin: var(--bp-value)">X4</i></span></span>');
    expect(moduleOf(html, "bars")).toContain('<span class="lc-pad"><span class="lc-ins"><i class="lc-tab" data-pin="table" style="--pin: var(--bp-table)">table</i></span><span class="lc-name"><b>Nights a year</b></span></span>');
  });

  it("says under a module what is written on the inputs no conduit feeds, and what it chose itself, each by the input's name", () => {
    expect(moduleOf(html, "whole")).toContain(
      '<span class="lc-told"><span class="lc-row written"><i>column</i><b>year</b></span><span class="lc-row written"><i>is</i><b>is at least</b></span><span class="lc-row written"><i>value</i><b>2002</b></span></span>',
    );
    expect(moduleOf(html, "bars")).toContain('<span class="lc-told"><span class="lc-row settled"><i>x</i><b>year</b></span><span class="lc-row settled"><i>height</i><b>nights</b></span></span>');
    expect(moduleOf(html, "place")).not.toContain("lc-told");
  });

  it("says what came out of a module, what kind it is where it has a name of its own, and a dial's setting as a reader would", () => {
    expect(moduleOf(html, "n")).toContain('<span class="lc-said">5 rows · year, nights</span>');
    expect(moduleOf(html, "whole")).toContain('<span class="lc-said">Keep rows · 3 of 5 rows</span>');
    expect(moduleOf(drawn(TEXT, { set: new Map([["place", "el Raval"]]) }), "place")).toContain('<span class="lc-said">Dial · el Raval</span>');
  });

  it("says what is written on an input as its list of choices says it: a station by its name", () => {
    expect(moduleOf(drawn("n = nights place: X4"), "n")).toContain('<span class="lc-row written"><i>place</i><b>el Raval</b></span>');
  });

  it("rounds the end of a module nothing arrives at, and the end nothing leaves from", () => {
    expect(classOf(moduleOf(html, "place"))).toEqual(expect.arrayContaining(["lc-module", "lc-role-dial", "begins"]));
    expect(classOf(moduleOf(html, "place"))).not.toContain("ends");
    expect(classOf(moduleOf(html, "whole"))).not.toEqual(expect.arrayContaining(["begins"]));
    expect(classOf(moduleOf(html, "bars"))).toEqual(expect.arrayContaining(["lc-role-paint", "ends"]));
    expect(classOf(moduleOf(drawn("n = nights"), "n"))).toEqual(expect.arrayContaining(["begins", "ends"]));
  });

  it("stands each module where the layout says, as wide as its column, in a world as big as the schematic", () => {
    const across = wide(false, true) + SCHEMATIC.channel;
    const told = SCHEMATIC.pad + 3 * SCHEMATIC.line + SCHEMATIC.said;
    expect(html.startsWith(`<div class="lc-world" style="width: ${across + 2 * (wide(true, true) + SCHEMATIC.channel) + wide(true, false)}px; height: ${told}px">`)).toBe(true);
    expect(moduleOf(html, "place")).toContain(`style="left: 0px; top: 0px; width: ${wide(false, true)}px; --lc-step: 0"`);
    expect(moduleOf(html, "n")).toContain(`style="left: ${across}px; top: 0px; width: ${wide(true, true)}px; --lc-step: 1"`);
  });

  it("runs a conduit for every wire, in the colour of what flows along it, from the port it leaves to the port of the input it feeds", () => {
    expect(html.match(/<g class="lc-conduit/g)?.length).toBe(3);
    const level = `M${wide(false, true)} ${SCHEMATIC.pad / 2} L${wide(false, true) + SCHEMATIC.channel} ${SCHEMATIC.pad / 2}`;
    expect(html).toContain(`data-key="wire:n.place:place.value" style="--pin: var(--bp-value); --lc-step: 0; --lc-from: ${wide(false, true)}"><path class="lc-line" d="${level}"></path>`);
    expect(html).toContain('data-key="wire:bars.table:whole.table" style="--pin: var(--bp-table)');
    const joined = drawn("a = nights\nb = nights\njoin left: a right: b");
    const ends = [...joined.matchAll(/data-key="wire:join\.(\w+):[^"]*"[^>]*><path class="lc-line" d="[^"]* (\S+)"/g)].map((found) => [found[1], Number(found[2])]);
    expect(ends).toEqual([["left", (SCHEMATIC.pad - SCHEMATIC.port) / 2], ["right", (SCHEMATIC.pad + SCHEMATIC.port) / 2]]);
  });

  it("draws along each conduit a stream to flow, and a pulse to go its length once, each as far out of step as the flow has come when it sets out", () => {
    const level = `M${wide(false, true)} ${SCHEMATIC.pad / 2} L${wide(false, true) + SCHEMATIC.channel} ${SCHEMATIC.pad / 2}`;
    expect(html).toContain(`<path class="lc-line" d="${level}"></path><path class="lc-stream" d="${level}"></path><path class="lc-pulse" d="${level}" pathLength="100"></path></g>`);
    // Out of the dial, along a channel, across the module it feeds: where the next conduit sets out.
    expect(html).toContain(`data-key="wire:whole.table:n.table" style="--pin: var(--bp-table); --lc-step: 1; --lc-from: ${wide(false, true) + SCHEMATIC.channel + wide(true, true)}"`);
  });

  it("calls a conduit by both its ends: one wired from somewhere else is another conduit, which is seen to begin", () => {
    expect(drawn("a = nights\nb = nights\nbars table: a")).toContain('data-key="wire:bars.table:a.table"');
    expect(drawn("a = nights\nb = nights\nbars table: b")).toContain('data-key="wire:bars.table:b.table"');
  });

  it("dims a module that has not answered and the conduits out of it, and marks one in trouble", () => {
    const waiting = drawn(TEXT, {}, false);
    expect(classOf(moduleOf(waiting, "n"))).toContain("idle");
    expect(waiting).toContain('<g class="lc-conduit idle" data-key="wire:whole.table:n.table"');
    expect(classOf(moduleOf(html, "n"))).not.toContain("idle");
    expect(classOf(moduleOf(drawn("bars"), "bars"))).toContain("trouble");
    expect(moduleOf(drawn("bars"), "bars")).toContain('<span class="lc-row missing"><i>table</i><b>—</b></span>');
  });

  it("marks the module chosen, and the conduits that touch it, so its part of the flow is seen apart", () => {
    const chosen = drawn(TEXT, { chosen: "whole" });
    expect(chosen).toMatch(/^<div class="lc-world tracing"/);
    expect(moduleOf(chosen, "whole")).toContain('aria-pressed="true"');
    expect(classOf(moduleOf(chosen, "whole"))).toContain("chosen");
    expect(moduleOf(chosen, "n")).toContain('aria-pressed="false"');
    expect(chosen).toContain('<g class="lc-conduit near" data-key="wire:whole.table:n.table"');
    expect(chosen).toContain('<g class="lc-conduit near" data-key="wire:bars.table:whole.table"');
    expect(chosen).toContain('<g class="lc-conduit" data-key="wire:n.place:place.value"');
  });

  it("lights the module pointed at from the board, without choosing it", () => {
    const pointed = drawn(TEXT, { pointed: "bars" });
    expect(classOf(moduleOf(pointed, "bars"))).toContain("pointed");
    expect(moduleOf(pointed, "bars")).toContain('aria-pressed="false"');
    expect(pointed).toMatch(/^<div class="lc-world"/);
  });

  it("marks a module each time it runs, differently from the time before, and what flows out of it with it", () => {
    const once = drawn(TEXT, { runs: new Map([["n", 1]]) });
    expect(classOf(moduleOf(once, "n"))).toContain("ran-1");
    expect(once).toContain('<g class="lc-conduit flow-1" data-key="wire:whole.table:n.table"');
    expect(classOf(moduleOf(once, "whole")).some((name) => name.startsWith("ran-"))).toBe(false);
    expect(classOf(moduleOf(drawn(TEXT, { runs: new Map([["n", 2]]) }), "n"))).toContain("ran-0");
  });

  it("keeps words written in a blueprint from becoming markup", () => {
    expect(drawn('n = nights "<b>Nights</b>"')).toContain("&lt;b&gt;Nights&lt;/b&gt;");
  });
});
