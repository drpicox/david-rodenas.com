import { describe, expect, it } from "vitest";
import { runningYearOf } from "./runningYearOf";

describe("the year still running, for a source", () => {
  it("is this year, once last year is held whole", () => {
    expect(runningYearOf([2024, 2025], new Date("2026-09-20T12:00:00Z"))).toBe(2026);
  });

  it("is last year, while it is not held whole yet: in January the portals do not have December", () => {
    expect(runningYearOf([2023, 2024], new Date("2026-01-04T12:00:00Z"))).toBe(2025);
  });
});
