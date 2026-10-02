import { describe, expect, it } from "vitest";
import { dayAndMonthOf } from "./dayAndMonthOf";

describe("a day, said without its year", () => {
  it("is the day and the month in words, as a sentence says it", () => {
    expect(dayAndMonthOf("2026-09-28")).toBe("28 September");
    expect(dayAndMonthOf("2026-01-04")).toBe("4 January");
  });
});
