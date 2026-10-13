import { describe, expect, it } from "vitest";
import { aKit } from "../blueprint/aKit";
import { evaluateBlueprint } from "../blueprint/evaluateBlueprint";
import { parseBlueprint } from "../blueprint/parseBlueprint";
import { cardsOf } from "./cardsOf";

const TEXT = 'n = nights\nbars "Nights a year" table: n\nbars "Rain" table: n y: rain\nlines';

describe("the pictures of a blueprint's board, one for every node that paints", () => {
  const { blueprint } = parseBlueprint(TEXT, aKit);

  it("are each under its node's title, with what it painted", () => {
    const [nights] = cardsOf(blueprint, aKit, evaluateBlueprint(blueprint, aKit, { read: () => "" }));
    expect(nights).toMatchObject({ node: "bars", title: "Nights a year" });
    expect(nights?.painting?.caption).toBe("nights by year, 5 bars");
  });

  it("say why there is no picture, where a node failed or was not wired", () => {
    const [, rain, lines] = cardsOf(blueprint, aKit, evaluateBlueprint(blueprint, aKit, { read: () => "" }));
    expect(rain).toEqual({ node: "bars-2", title: "Rain", problem: "height: the table has no column rain — it has year, nights" });
    expect(lines).toEqual({ node: "lines", title: "Lines", problem: "Wire a table into it." });
  });

  it("wait while the blueprint has not run", () => {
    expect(cardsOf(blueprint, aKit, new Map()).map((card) => card.waiting)).toEqual([true, true, true]);
  });
});
