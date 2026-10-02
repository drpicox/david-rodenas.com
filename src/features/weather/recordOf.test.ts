import { describe, expect, it } from "vitest";
import { aWeatherStation } from "./aWeatherStation";
import { recordOf } from "./recordOf";
import { steadyYear } from "./steadyYear";

const station = aWeatherStation({ "2023": steadyYear(2023, 18), "2024": steadyYear(2024, 22) });
const months = [6];

describe("the most extreme day on record", () => {
  it("is the highest, with its date, for a question about days at or above a threshold", () => {
    expect(recordOf(station, { variable: "tn", atLeast: true, threshold: 20, months })).toEqual({ value: 22, date: "2024-07-01" });
  });

  it("is the lowest, with its date, for a question about days below one", () => {
    expect(recordOf(station, { variable: "tn", atLeast: false, threshold: 0, months })).toEqual({ value: 18, date: "2023-01-01" });
  });

  it("is nothing where the variable was never measured", () => {
    expect(recordOf(station, { variable: "pp", atLeast: true, threshold: 1, months })).toBeNull();
  });
});
