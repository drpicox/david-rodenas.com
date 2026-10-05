import { describe, expect, it } from "vitest";
import { aKit } from "./aKit";
import { evaluateBlueprint } from "./evaluateBlueprint";
import { parseBlueprint } from "./parseBlueprint";
import { renderBlueprintSvg } from "./renderBlueprintSvg";
import { tidyBlueprint } from "./tidyBlueprint";

const read = () => "";
const drawn = (text: string) => {
  const blueprint = tidyBlueprint(parseBlueprint(text, aKit).blueprint, aKit);
  return renderBlueprintSvg(blueprint, aKit, evaluateBlueprint(blueprint, aKit, { read }), read);
};

describe("a blueprint drawn for the page before any script", () => {
  const html = drawn(['n = nights "Hot nights" place: X4', "bars table: n y: rain", 'note text: "Try another place: the nights are made up."'].join("\n"));

  it("draws every node with its title, and every wire in the colour of what flows along it", () => {
    expect(html.match(/<g class="bp-node/g)?.length).toBe(3);
    expect(html).toContain(">Hot nights<");
    expect(html).toContain('class="bp-wire"');
    expect(html).toContain("stroke: var(--bp-table)");
  });

  it("says what is written on each input as it reads, and what a node chose itself", () => {
    expect(html).toMatch(/class="value written"[^>]*>el Raval</);
    expect(html).toMatch(/class="value initial"[^>]*>2000</);
  });

  it("marks a node in trouble, and says why at its foot, whole when pointed at if it is too long to fit", () => {
    expect(html).toContain('class="bp-node bp-role-paint trouble"');
    expect(html).toMatch(/class="foot trouble"[^>]*><title>height: the table has no column rain — it has year, nights<\/title>height: the table has no column/);
  });

  it("writes a note's words on it, wrapped", () => {
    expect(html).toContain("<tspan");
    expect(html).toContain("Try another place:");
  });

  it("frames all of it, however far the nodes stand from the corner", () => {
    expect(html).toMatch(/^<svg class="bp-diagram" viewBox="-24 -24 /);
  });
});
