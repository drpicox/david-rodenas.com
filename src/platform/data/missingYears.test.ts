import { describe, expect, it } from "vitest";
import { missingYears } from "./missingYears";

describe("the years still to be asked for", () => {
  const in2026 = new Date("2026-09-20T12:00:00Z");

  it("is every finished year that is not held yet, oldest first", () => {
    expect(missingYears([2022, 2024], 2021, in2026)).toEqual([2021, 2023, 2025]);
  });

  it("never includes the year that is still running: half a year is not a year", () => {
    expect(missingYears([], 2025, in2026)).toEqual([2025]);
    expect(missingYears([], 2026, in2026)).toEqual([]);
  });

  it("is nothing until the year changes, and the year that ended once it has", () => {
    const held = [2023, 2024, 2025];
    expect(missingYears(held, 2023, in2026)).toEqual([]);
    expect(missingYears(held, 2023, new Date("2027-01-02T12:00:00Z"))).toEqual([2026]);
  });
});
