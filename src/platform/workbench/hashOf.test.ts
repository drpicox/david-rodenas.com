import { describe, expect, it } from "vitest";
import { hashOf } from "./hashOf";

describe("a short name for some text", () => {
  it("is the same for the same text, and another for another", () => {
    expect(hashOf("bars table: heat")).toBe(hashOf("bars table: heat"));
    expect(hashOf("bars table: heat")).not.toBe(hashOf("bars table: cold"));
    expect(hashOf("")).toMatch(/^[0-9a-z]+$/);
  });
});
