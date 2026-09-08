import { describe, expect, it } from "vitest";
import { simulateMeetings } from "./simulateMeetings";
import { summariseMeetings } from "./summariseMeetings";

const run = { focus: 25, fatigue: 15, featureSize: 300, weeks: 2, calendar: { "0-3": "Lunch" }, meetingTypes: { Lunch: { focus: -100, fatigue: -100 } } };

describe("summariseMeetings", () => {
  it("adds up features and work, and averages them per week", () => {
    const hours = simulateMeetings(run);
    const summary = summariseMeetings(hours, run);
    const last = hours.at(-1)!;
    expect(summary.totalProductivity).toBe(last.completedFeatures * 300 + last.accumulatedProductivity);
    expect(summary.averageFeaturesPerWeek).toBeCloseTo(summary.totalFeatures / 2, 5);
  });

  it("folds every week onto one: a day's productivity, features and meeting hours", () => {
    const summary = summariseMeetings(simulateMeetings(run), run);
    expect(summary.days).toHaveLength(5);
    expect(summary.days[0]!.meetings).toBe(2);
    expect(summary.days[1]!.meetings).toBe(0);
  });

  it("averages each hour of the week over the weeks, for the heat maps", () => {
    const summary = summariseMeetings(simulateMeetings(run), run);
    expect(summary.hours.productivity).toHaveLength(8);
    expect(summary.hours.productivity[0]).toHaveLength(5);
    expect(summary.hours.productivity[3]![0]).toBe(0);
    expect(summary.hours.focus[0]![1]).toBe(25);
  });
});
