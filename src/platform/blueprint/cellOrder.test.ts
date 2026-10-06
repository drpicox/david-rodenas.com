import { describe, expect, it } from "vitest";
import { cellOrder } from "./cellOrder";

describe("two cells in order", () => {
  it("puts numbers in the order of their size, not of their digits", () => {
    expect([10, 9, 100].sort(cellOrder)).toEqual([9, 10, 100]);
  });

  it("puts words in the order of the alphabet", () => {
    expect(["winter", "autumn", "spring"].sort(cellOrder)).toEqual(["autumn", "spring", "winter"]);
  });

  it("puts a cell that holds nothing before every number", () => {
    expect([3, null, -2].sort(cellOrder)).toEqual([null, -2, 3]);
  });
});
