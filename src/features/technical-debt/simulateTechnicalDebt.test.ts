import { describe, expect, it } from "vitest";
import { simulateTechnicalDebt } from "./simulateTechnicalDebt";

const defaults = { baseTime: 20, shortcutFactor: 0.25, interestRate: 0.1, timeHorizon: 24 };

describe("simulateTechnicalDebt", () => {
  it("reports one row per month", () => {
    const { months } = simulateTechnicalDebt(defaults);
    expect(months).toHaveLength(24);
    expect(months[0]?.month).toBe(1);
    expect(months[23]?.month).toBe(24);
  });

  it("delivers clean features at a steady rate: one every baseTime days, 20 days a month", () => {
    const { months } = simulateTechnicalDebt({ ...defaults, interestRate: 0 });
    expect(months[0]?.cleanMonthly).toBe(1);
    expect(months[11]?.cleanCumulative).toBe(12);
  });

  it("starts faster with shortcuts and slows as the interest compounds", () => {
    const { months } = simulateTechnicalDebt(defaults);
    expect(months[0]!.debtCumulative).toBeGreaterThanOrEqual(months[0]!.cleanCumulative);
    expect(months[23]!.debtCumulative).toBeLessThan(months[23]!.cleanCumulative);
    expect(months[23]!.debtMonthly).toBeLessThan(months[0]!.debtMonthly);
  });

  it("finds the month when clean overtakes debt, or admits it never does", () => {
    expect(simulateTechnicalDebt(defaults).breakEvenMonth).toBeGreaterThan(1);
    expect(simulateTechnicalDebt({ ...defaults, interestRate: 0 }).breakEvenMonth).toBeNull();
  });

  it("charges the same interest on every feature: the cost grows geometrically", () => {
    const { months } = simulateTechnicalDebt({ ...defaults, timeHorizon: 6 });
    const after = months[5]!;
    expect(after.debtFeatureCost).toBeCloseTo(15 * 1.1 ** after.debtCumulative, 5);
  });
});
