import { describe, expect, it } from "vitest";
import { initialValues } from "../../platform/program/initialValues";
import { settleValues } from "../../platform/program/settleValues";
import { technicalDebtProgram } from "./technicalDebtProgram";

const run = (given: Record<string, number> = {}) => {
  const settled = settleValues(technicalDebtProgram, given);
  if ("error" in settled) throw new Error(settled.error);
  return technicalDebtProgram.run(settled.values);
};

describe("technical debt, as a program", () => {
  it("starts where the page always started: twenty days a feature, a quarter saved, ten percent interest, two years", () => {
    expect(initialValues(technicalDebtProgram)).toEqual({ "base-time": 20, shortcuts: 25, interest: 10, timeline: 24 });
  });

  it("says in words where the clean road overtakes, and by how much it is ahead at the end", () => {
    const { text, data } = run();
    const { breakEvenMonth } = data as { breakEvenMonth: number };
    expect(breakEvenMonth).toBeGreaterThan(1);
    expect(text).toContain(`clean development overtakes at month ${breakEvenMonth}`);
    expect(text).toMatch(/^clean \d+ features, debt-driven \d+, break-even month \d+/);
  });

  it("admits the one case where the shortcut wins: no interest", () => {
    const { text, data } = run({ interest: 0 });
    expect((data as { breakEvenMonth: number | null }).breakEvenMonth).toBeNull();
    expect(text).toContain("the shortcut simply wins");
  });

  it("gives an agent the figures, month by month, and not a picture of them", () => {
    const { data } = run({ timeline: 12 });
    const { months, cleanFeatures, debtFeatures } = data as { months: unknown[]; cleanFeatures: number; debtFeatures: number };
    expect(months).toHaveLength(12);
    expect(cleanFeatures).toBe(12);
    expect(debtFeatures).toBeGreaterThan(0);
  });

  it("draws the two charts the page always drew", () => {
    const { html } = run();
    expect(html).toContain("Cumulative features");
    expect(html).toContain("Monthly delivery rate");
    expect(html.match(/<svg/g)).toHaveLength(2);
  });
});
