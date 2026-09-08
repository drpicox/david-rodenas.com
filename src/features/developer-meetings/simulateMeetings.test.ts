import { describe, expect, it } from "vitest";
import { simulateMeetings, type MeetingTypes } from "./simulateMeetings";

const types: MeetingTypes = {
  Lunch: { focus: -100, fatigue: -100 },
  Boring: { focus: -50, fatigue: -25 },
};

const quiet = { focus: 25, fatigue: 15, featureSize: 300, weeks: 1, calendar: {}, meetingTypes: types };

describe("simulateMeetings", () => {
  it("simulates 8 hours a day, 5 days a week", () => {
    expect(simulateMeetings(quiet)).toHaveLength(40);
    expect(simulateMeetings({ ...quiet, weeks: 3 })).toHaveLength(120);
  });

  it("builds focus and fatigue hour by hour, and produces their difference, clamped to 0..100", () => {
    const [first, second] = simulateMeetings(quiet);
    expect(first).toMatchObject({ hourFocus: 25, hourFatigue: 15, hourProductivity: 10 });
    expect(second).toMatchObject({ hourFocus: 50, hourFatigue: 30, hourProductivity: 20 });
    const late = simulateMeetings({ ...quiet, focus: 60, fatigue: 0 })[3]!;
    expect(late.hourFocus).toBe(100);
  });

  it("produces nothing in a meeting, and the meeting moves focus and fatigue", () => {
    const hours = simulateMeetings({ ...quiet, calendar: { "0-1": "Boring" } });
    expect(hours[1]).toMatchObject({ hourProductivity: 0, hourFocus: 0, hourFatigue: 0 });
  });

  it("completes a feature when the work reaches its size, then focus starts over", () => {
    const hours = simulateMeetings({ ...quiet, featureSize: 25 });
    const done = hours.findIndex((hour) => hour.featureCompleted);
    expect(done).toBeGreaterThan(0);
    expect(hours[done]!.completedFeatures).toBe(1);
    expect(hours[done + 1]!.hourFocus).toBe(25);
  });

  it("counts fewer features when the week is full of meetings", () => {
    const calendar: Record<string, string> = {};
    for (let day = 0; day < 5; day += 1) for (const hour of [1, 3, 5]) calendar[`${day}-${hour}`] = "Boring";
    const busy = simulateMeetings({ ...quiet, weeks: 8, calendar });
    const free = simulateMeetings({ ...quiet, weeks: 8 });
    expect(busy.at(-1)!.completedFeatures).toBeLessThan(free.at(-1)!.completedFeatures);
  });
});
