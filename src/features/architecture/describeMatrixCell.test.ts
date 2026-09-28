import { describe, expect, it } from "vitest";
import { describeMatrixCell } from "./describeMatrixCell";

const commit = { sha: "14eafee", date: "2026-09-12T10:00:00+02:00", subject: "The paper is the console" };

describe("a cell of the picture of changes, said in words", () => {
  it("says the box, the day and what the commit did there, by file name, and what the commit said it did", () => {
    expect(describeMatrixCell("platform/page", commit, { changed: ["platform/page/renderDocument.ts", "platform/page/renderMain.ts"], written: ["platform/page/isHere.ts"] })).toBe(
      "platform/page, 12 Sep: changed renderDocument.ts and renderMain.ts; wrote isHere.ts — The paper is the console",
    );
  });

  it("names three files at most, and counts the rest", () => {
    const written = ["a", "b", "c", "d", "e"].map((name) => `features/f/${name}.ts`);
    expect(describeMatrixCell("features/f", commit, { changed: [], written })).toBe("features/f, 12 Sep: wrote a.ts, b.ts, c.ts and 2 more — The paper is the console");
  });

  it("says when a commit did nothing in the box, and calls the row of the files that went by what it is", () => {
    expect(describeMatrixCell(null, commit, { changed: [], written: [] })).toBe("the files now gone, 12 Sep: nothing — The paper is the console");
  });
});
