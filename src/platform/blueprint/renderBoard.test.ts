import { describe, expect, it } from "vitest";
import { aKit } from "./aKit";
import { evaluateBlueprint } from "./evaluateBlueprint";
import { parseBlueprint } from "./parseBlueprint";
import { renderBoard } from "./renderBoard";

const read = () => "";
const board = (text: string) => {
  const { blueprint } = parseBlueprint(text, aKit);
  return renderBoard(blueprint, aKit, evaluateBlueprint(blueprint, aKit, { read }), read);
};

describe("a blueprint's board, before any script", () => {
  const html = board(['where = dial "Place" value: X4 @ 0 0', "n = nights place: where @ 300 0", 'bars "Nights a year" table: n @ 600 200', 'readout "Too few" @ 600 0'].join("\n"));

  it("says what each dial is set to", () => {
    expect(html).toContain('<dl class="bp-dials"><div class="bp-dial"><dt>Place</dt><dd>el Raval</dd></div></dl>');
  });

  it("shows every picture under its node's title, over its caption and whose numbers it shows, in the order the text has them", () => {
    expect(html.indexOf("Nights a year")).toBeLessThan(html.indexOf("Too few"));
    expect(html).toContain("<figcaption>Nights a year</figcaption>");
    expect(html).toContain('<p class="bp-caption">nights by year, 5 bars</p>');
    expect(html).toContain('<p class="bp-credits">Source: Made up.</p>');
  });

  it("says why a picture could not be made, where it would have been", () => {
    expect(html).toContain('<figure class="bp-card unpainted" data-node="readout"><figcaption>Too few</figcaption><p class="bp-problem">it needs value</p></figure>');
  });
});
