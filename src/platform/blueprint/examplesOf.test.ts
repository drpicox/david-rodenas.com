import { describe, expect, it } from "vitest";
import { examplesOf } from "./examplesOf";

describe("the examples a blueprint's text holds", () => {
  it("are one, with no title, when it gives none", () => {
    expect(examplesOf("n = nights\nbars table: n\n")).toEqual([{ title: "", slug: "", about: "", text: "n = nights\nbars table: n" }]);
  });

  it("are one a title, each with the words written under its title and its own lines", () => {
    const source = "## Hot nights\n# The nights, a bar a year.\n# Turn the station.\nn = nights\nbars table: n\n\n## Your own\nmine = your-data\n";
    expect(examplesOf(source)).toEqual([
      { title: "Hot nights", slug: "hot-nights", about: "The nights, a bar a year. Turn the station.", text: "n = nights\nbars table: n" },
      { title: "Your own", slug: "your-own", about: "", text: "mine = your-data" },
    ]);
  });

  it("keep what stands before the first title as one with none, and nothing that is only words", () => {
    expect(examplesOf("n = nights\n## Bars\nbars").map((example) => example.title)).toEqual(["", "Bars"]);
    expect(examplesOf("# what follows\n\n## Bars\nbars").map((example) => example.title)).toEqual(["Bars"]);
  });
});
