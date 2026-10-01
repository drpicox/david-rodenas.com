import { describe, expect, it } from "vitest";
import { talksOn } from "./talksOn";

const PAGE = `# Talks

## BarcelonaJS and the Barcelona meetups

2013 to 2017 were the years of the meetups.

2013-05 :: **[GruntJS](https://github.com/drpicox/tutorial-gruntjs-v1)**, BarcelonaJS.
2016-06 :: **The Bowling Game Kata**, twice in a fortnight. It is [still here](/teaching/kata/).

## Since 2022: algorithms, for people who do not write them

2025 → 2026 :: **Vols una galeta?** -- Sabadell, Barcelona, *Altafulla*.`;

describe("the talks a page lists", () => {
  it("are each dated line, its title the words in bold, said as plain words under the subject it is grouped under", () => {
    expect(talksOn(PAGE, "https://david-rodenas.com")).toEqual([
      { date: "2013-05", title: "GruntJS", url: "https://github.com/drpicox/tutorial-gruntjs-v1", about: "BarcelonaJS and the Barcelona meetups", said: "GruntJS, BarcelonaJS." },
      { date: "2016-06", title: "The Bowling Game Kata", url: "https://david-rodenas.com/teaching/kata/", about: "BarcelonaJS and the Barcelona meetups", said: "The Bowling Game Kata, twice in a fortnight. It is still here." },
      { date: "2025 → 2026", title: "Vols una galeta?", about: "Since 2022: algorithms, for people who do not write them", said: "Vols una galeta? — Sabadell, Barcelona, Altafulla." },
    ]);
  });
});
