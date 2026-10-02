import { describe, expect, it } from "vitest";
import type { RunningYear } from "./RunningYear";
import { withSoFar } from "./withSoFar";

type Station = { code: string; years: Record<string, number> };
const station: Station = { code: "WU", years: { 2024: 24, 2025: 25 } };
const running: RunningYear<Station> = { year: 2026, through: "2026-09-28", refreshed: "2026-09-30", files: { "WU.json": { code: "WU", years: { 2026: 20 } } } };

describe("a file of finished years, with the year still running beside them", () => {
  it("holds the running year among the others, and says it is so far and to which day", () => {
    expect(withSoFar(station, running, "WU.json")).toEqual({ code: "WU", years: { 2024: 24, 2025: 25, 2026: 20 }, soFar: { year: 2026, through: "2026-09-28" } });
  });

  it("is as it was without a running year, or with none for this file", () => {
    expect(withSoFar(station, null, "WU.json")).toEqual(station);
    expect(withSoFar(station, running, "X4.json")).toEqual(station);
  });

  it("is as it was when the running year is already held whole: an old copy is not news", () => {
    const held: Station = { code: "WU", years: { 2025: 25, 2026: 26 } };
    expect(withSoFar(held, running, "WU.json")).toEqual(held);
  });
});
