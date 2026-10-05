import { describe, expect, it } from "vitest";
import { numberSaid } from "./numberSaid";

describe("a number, said as a person would read it off a picture", () => {
  it("keeps a whole number whole", () => {
    expect(numberSaid(1889)).toBe("1889");
  });

  it("keeps as many decimals as the size of the number deserves, and no trailing zeros", () => {
    expect(numberSaid(123.456)).toBe("123.5");
    expect(numberSaid(12.3456)).toBe("12.35");
    expect(numberSaid(1.5)).toBe("1.5");
    expect(numberSaid(0.04213)).toBe("0.0421");
  });

  it("writes a minus as a minus, not a hyphen", () => {
    expect(numberSaid(-0.4213)).toBe("−0.421");
  });

  it("says what is not a number", () => {
    expect(numberSaid(Number.NaN)).toBe("—");
    expect(numberSaid(0)).toBe("0");
  });
});
