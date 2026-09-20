import { describe, expect, it } from "vitest";
import { layeredJson } from "./layeredJson";

describe("JSON written to be kept in git", () => {
  it("gives each year a line of its own, so adding a year is adding a line", () => {
    const text = layeredJson({ code: "WU", years: { 2024: { a: [1, 2] }, 2025: { a: [3] } } }, 2);
    expect(text).toBe(`{\n"code":"WU",\n"years":{\n"2024":{"a":[1,2]},\n"2025":{"a":[3]}\n}\n}\n`);
  });

  it("says the same thing JSON.stringify would", () => {
    const value = { a: [1, { b: null }], c: { d: { e: "f\n" } }, g: {} };
    expect(JSON.parse(layeredJson(value, 2))).toEqual(value);
  });
});
