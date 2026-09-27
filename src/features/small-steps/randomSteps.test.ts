import { describe, expect, it } from "vitest";
import { randomOf } from "../../platform/random/randomOf";
import { randomSteps } from "./randomSteps";

describe("a run of small steps, drawn at random", () => {
  it("starts with a test, and cleans no more than three times before the next one", () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const steps = randomSteps(randomOf(seed), 40);
      expect(steps).toHaveLength(40);
      expect(steps[0]).toBe("test");
      expect(steps.join(" ")).not.toMatch(/(clean ){4}/);
    }
  });

  it("is a different run each time the dice are different, and the same run for the same dice", () => {
    expect(randomSteps(randomOf(1), 40)).toEqual(randomSteps(randomOf(1), 40));
    expect(randomSteps(randomOf(1), 40)).not.toEqual(randomSteps(randomOf(2), 40));
  });
});
