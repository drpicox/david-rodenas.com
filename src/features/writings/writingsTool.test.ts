import { describe, expect, it } from "vitest";
import { Site } from "../../platform/content/Site";
import { writingsTool } from "./writingsTool";

const ORIGIN = "https://david-rodenas.com";
const site = new Site([
  { file: "index.md", markdown: "# Home\n" },
  {
    file: "essays/index.md",
    markdown: `---
title: Essays
summary: More than 250 essays on Medium.
---
# Essays

One every Saturday, on [Medium](https://drpicox.medium.com).

## Testing

- [The Unit Test Trap](https://medium.com/p/4a83e4012b17)  
  Do you find your unit tests costly?

## Working with an AI

- [The New Role of TDD in the Incoming AI Era](https://medium.com/p/dfaf65024d9)  
  Now that Copilot is here, TDD matters more than ever.
`,
  },
  {
    file: "talks/index.md",
    markdown: `---
title: Talks
summary: Twenty-one years of them.
---
# Talks

## The meetups

2013-05 :: **GruntJS**, BarcelonaJS.
2022-10-25 :: **TDD is not a stupid idea, it's brilliant**, BarcelonaJS.
`,
  },
]);

type Listed = { summary: string; route?: string; data: { essays: { title: string }[]; talks: { title: string }[]; more: Record<string, { said: string; url: string }> } };
const ask = async (input: Record<string, unknown>) => (await writingsTool.answer(input, { site, origin: ORIGIN })) as Listed;
const titles = (listed: Listed) => [...listed.data.essays, ...listed.data.talks].map(({ title }) => title);

describe("what David has written and said, for an agent", () => {
  it("is every essay and talk the site lists, and where to find the rest", async () => {
    const listed = await ask({});
    expect(titles(listed)).toEqual(["The Unit Test Trap", "The New Role of TDD in the Incoming AI Era", "GruntJS", "TDD is not a stupid idea, it's brilliant"]);
    expect(listed.data.more).toEqual({
      essays: { said: "More than 250 essays on Medium.", url: "https://drpicox.medium.com" },
      talks: { said: "Twenty-one years of them.", url: "https://david-rodenas.com/talks/" },
    });
  });

  it("is the ones about some words, in their title, what they say, or the subject they are grouped under", async () => {
    expect(titles(await ask({ about: "tdd" }))).toEqual(["The New Role of TDD in the Incoming AI Era", "TDD is not a stupid idea, it's brilliant"]);
    expect(titles(await ask({ about: "ai" }))).toEqual(["The New Role of TDD in the Incoming AI Era"]);
  });

  it("is only essays, or only talks, when asked for one kind, with the page that lists them", async () => {
    const essays = await ask({ kind: "essays" });
    expect(titles(essays)).toEqual(["The Unit Test Trap", "The New Role of TDD in the Incoming AI Era"]);
    expect(essays.route).toBe("/essays/");
    expect(Object.keys(essays.data.more)).toEqual(["essays"]);
  });

  it("is the talks of some years, when asked for years: only the talks are dated", async () => {
    expect(titles(await ask({ from: 2020 }))).toEqual(["TDD is not a stupid idea, it's brilliant"]);
    expect(titles(await ask({ to: 2015 }))).toEqual(["GruntJS"]);
  });

  it("says how many in words, and where the rest are", async () => {
    expect((await ask({ about: "tdd" })).summary).toBe('1 essay and 1 talk about "tdd". More than 250 essays on Medium: https://drpicox.medium.com');
  });

  it("refuses what it cannot ask the pages", async () => {
    expect(await writingsTool.answer({ kind: "poems" }, { site, origin: ORIGIN })).toEqual({ refused: "kind: poems is not one of essays, talks or both" });
    expect(await writingsTool.answer({ from: "last year" }, { site, origin: ORIGIN })).toEqual({ refused: "from: last year is not a year" });
    expect(await writingsTool.answer({ kind: "essays", from: 2024 }, { site, origin: ORIGIN })).toEqual({ refused: "from: the essays are not dated here; years are for talks" });
  });
});
