import { describe, expect, it } from "vitest";
import { aKit } from "../../platform/blueprint/aKit";
import type { Wire } from "../../platform/blueprint/Blueprint";
import { parseBlueprint } from "../../platform/blueprint/parseBlueprint";
import { questionOf } from "./questionOf";

const of = (text: string) => parseBlueprint(text, aKit).blueprint;
const wire = (from: string, out: string, to: string, into: string): Wire => ({ from: { node: from, pin: out }, to: { node: to, pin: into } });

describe("what the display asks when a conduit could be run more ways than one", () => {
  it("asks which input, where only that is open, and says of each what an answer would take the place of, in the colour of what is carried", () => {
    const question = questionOf(of('a = nights "Hot nights"\nb = nights\njoin left: a'), aKit, [wire("b", "table", "join", "left"), wire("b", "table", "join", "right")]);
    expect(question.asked).toBe("Which input of Join does Nights feed?");
    expect(question.choices).toEqual([
      { label: "left", said: "in place of Hot nights", colour: "--bp-table" },
      { label: "right", said: "nothing feeds it yet", colour: "--bp-table" },
    ]);
  });

  it("asks which of what a module gives, where it gives several and only one input could take them", () => {
    const question = questionOf(of("n = nights\nt = trend table: n\nreadout"), aKit, [wire("t", "per-ten", "readout", "value"), wire("t", "slope", "readout", "value")]);
    expect(question.asked).toBe("What of Trend feeds value of Number?");
    expect(question.choices.map((choice) => choice.label)).toEqual(["for each ten", aKit.kinds.get("trend")?.outputs[1]?.label]);
    expect(question.choices.map((choice) => choice.colour)).toEqual(["--bp-number", "--bp-number"]);
  });

  it("asks both at once where both are open: each answer says what, and into which input", () => {
    const question = questionOf(of("n = nights\nt = trend table: n\njoin"), aKit, [wire("t", "per-ten", "join", "left"), wire("t", "slope", "join", "right")]);
    expect(question.asked).toBe("What of Trend feeds which input of Join?");
    expect(question.choices[0]?.label).toBe("for each ten → left");
  });

  it("calls by its name whatever its kind has no words for, and asks nothing where there is nothing to ask", () => {
    const question = questionOf(of("n = nights\nwhat"), aKit, [wire("n", "table", "what", "one"), wire("n", "table", "what", "two")]);
    expect(question.asked).toBe("Which input of what does Nights feed?");
    expect(question.choices.map((choice) => choice.label)).toEqual(["one", "two"]);
    expect(questionOf(of("n = nights"), aKit, [])).toEqual({ asked: "", choices: [] });
  });
});
