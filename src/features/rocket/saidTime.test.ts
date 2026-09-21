import { describe, expect, it } from "vitest";
import { saidTime } from "./saidTime";

describe("a length of time, the way a person would say it", () => {
  it("picks the unit that keeps the number small", () => {
    expect(saidTime(42)).toBe("42 seconds");
    expect(saidTime(3.5 * 3600)).toBe("3.5 hours");
    expect(saidTime(12.25 * 86400)).toBe("12 days");
    expect(saidTime(3.6 * 365.25 * 86400)).toBe("3.6 years");
    expect(saidTime(26000 * 365.25 * 86400)).toBe("26,000 years");
    expect(saidTime(2.5e6 * 365.25 * 86400)).toBe("2.5 million years");
  });
});
