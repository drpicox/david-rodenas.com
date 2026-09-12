import { describe, expect, it } from "vitest";
import { headlineRounds } from "./headlineRounds";

const lines = ["home", "a", "b", "c"];

describe("headlineRounds", () => {
  it("says every line once before any line comes round again", () => {
    let seed = 3;
    const random = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const next = headlineRounds(lines, random);
    const said: string[] = [];
    let current = "home";
    for (let turn = 0; turn < 8; turn += 1) said.push((current = next(current)));
    expect([...said.slice(0, 4)].sort()).toEqual(["a", "b", "c", "home"]);
    expect([...said.slice(4, 8)].sort()).toEqual(["a", "b", "c", "home"]);
  });

  it("never types the line that is already showing", () => {
    for (const value of [0, 0.25, 0.5, 0.75, 0.999]) {
      const next = headlineRounds(lines, () => value);
      let current = "home";
      for (let turn = 0; turn < 12; turn += 1) {
        const following = next(current);
        expect(following).not.toBe(current);
        current = following;
      }
    }
  });
});
