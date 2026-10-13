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

describe("a schematic, as markup", () => {
  const html = drawn();

  it("draws a module for every node: the figure it carries, its name, and what came out of it", () => {
    expect(html.match(/<button/g)?.length).toBe(4);
    expect(moduleOf(html, "n")).toMatch(/<span class="lc-code">5<\/span><span class="lc-name"><b>Nights<\/b><\/span>/);
    expect(moduleOf(html, "n")).toContain('<span class="lc-said">5 rows · year, nights</span>');
    expect(moduleOf(html, "n")).toContain('title="the nights of each year, made up for a test"');
  });

  it("says what kind a module is where it has a name of its own, and a dial's setting as a reader would", () => {
    expect(moduleOf(html, "whole")).toContain('<span class="lc-said">Keep rows · 3 of 5 rows</span>');
    expect(moduleOf(drawn(TEXT, { set: new Map([["place", "el Raval"]]) }), "place")).toContain('<span class="lc-said">Dial · el Raval</span>');
  });

  it("rounds the end of a module nothing arrives at, and the end nothing leaves from", () => {
    expect(classOf(moduleOf(html, "place"))).toEqual(expect.arrayContaining(["lc-module", "lc-role-dial", "begins"]));
    expect(classOf(moduleOf(html, "place"))).not.toContain("ends");
    expect(classOf(moduleOf(html, "whole"))).not.toEqual(expect.arrayContaining(["begins"]));
    expect(classOf(moduleOf(html, "bars"))).toEqual(expect.arrayContaining(["lc-role-paint", "ends"]));
  });

  it("stands each module where the layout says, in a world as big as the schematic", () => {
    const across = SCHEMATIC.module + SCHEMATIC.channel;
    expect(html.startsWith(`<div class="lc-world" style="width: ${across * 3 + SCHEMATIC.module}px; height: ${SCHEMATIC.row}px">`)).toBe(true);
    expect(moduleOf(html, "place")).toContain('style="left: 0px; top: 0px; --lc-step: 0"');
    expect(moduleOf(html, "n")).toContain(`style="left: ${across}px; top: 0px; --lc-step: 1"`);
  });

  it("runs a conduit for every wire, in the colour of what flows along it", () => {
    expect(html.match(/<g class="lc-conduit/g)?.length).toBe(3);
    const level = `M${SCHEMATIC.module} ${SCHEMATIC.pad / 2} L${SCHEMATIC.module + SCHEMATIC.channel} ${SCHEMATIC.pad / 2}`;
    expect(html).toContain(`data-key="wire:n.place" style="--pin: var(--bp-value); --lc-step: 0"><path class="lc-line" d="${level}"></path><path class="lc-pulse" d="${level}" pathLength="100"></path></g>`);
    expect(html).toContain('data-key="wire:bars.table" style="--pin: var(--bp-table)');
  });

  it("dims a module that has not answered and the conduits out of it, and marks one in trouble", () => {
    const waiting = drawn(TEXT, {}, false);
    expect(classOf(moduleOf(waiting, "n"))).toContain("idle");
    expect(waiting).toContain('<g class="lc-conduit idle" data-key="wire:whole.table"');
    expect(classOf(moduleOf(html, "n"))).not.toContain("idle");
    expect(classOf(moduleOf(drawn("bars"), "bars"))).toContain("trouble");
  });

  it("marks the module chosen, and the conduits that touch it, so its part of the flow is seen apart", () => {
    const chosen = drawn(TEXT, { chosen: "whole" });
    expect(chosen).toMatch(/^<div class="lc-world tracing"/);
    expect(moduleOf(chosen, "whole")).toContain('aria-pressed="true"');
    expect(classOf(moduleOf(chosen, "whole"))).toContain("chosen");
    expect(moduleOf(chosen, "n")).toContain('aria-pressed="false"');
    expect(chosen).toContain('<g class="lc-conduit near" data-key="wire:whole.table"');
    expect(chosen).toContain('<g class="lc-conduit near" data-key="wire:bars.table"');
    expect(chosen).toContain('<g class="lc-conduit" data-key="wire:n.place"');
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
    expect(once).toContain('<g class="lc-conduit flow-1" data-key="wire:whole.table"');
    expect(classOf(moduleOf(once, "whole")).some((name) => name.startsWith("ran-"))).toBe(false);
    expect(classOf(moduleOf(drawn(TEXT, { runs: new Map([["n", 2]]) }), "n"))).toContain("ran-0");
  });

  it("keeps words written in a blueprint from becoming markup", () => {
    expect(drawn('n = nights "<b>Nights</b>"')).toContain("&lt;b&gt;Nights&lt;/b&gt;");
  });
});
