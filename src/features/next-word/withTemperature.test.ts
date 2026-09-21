import { describe, expect, it } from "vitest";
import { withTemperature } from "./withTemperature";

const candidates = [
  { word: "cat", count: 3, probability: 0.75 },
  { word: "dog", count: 1, probability: 0.25 },
];
const chances = (temperature: number) => withTemperature(candidates, temperature).map(({ probability }) => probability);

describe("temperature: how much the model is allowed to surprise", () => {
  it("leaves the chances as they were learnt at 1", () => {
    expect(chances(1)).toEqual([0.75, 0.25]);
  });

  it("makes the likely likelier when cold, until at zero only the likeliest is left", () => {
    expect(chances(0.5)[0]).toBeCloseTo(0.9);
    expect(chances(0)).toEqual([1, 0]);
  });

  it("evens the chances out when hot", () => {
    expect(chances(2)[0]).toBeCloseTo(0.634, 3);
    expect(chances(100)[0]).toBeCloseTo(0.5, 1);
  });

  it("always adds up to one, and keeps the count that was seen", () => {
    expect(chances(0.3).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    expect(withTemperature(candidates, 0.3)[0]?.count).toBe(3);
  });
});
