import { describe, expect, it } from "vitest";
import { resolvePath } from "./resolvePath";

describe("resolvePath", () => {
  it("treats ~ and / as the root", () => {
    expect(resolvePath("/book/", "~")).toBe("/");
    expect(resolvePath("/book/", "/")).toBe("/");
    expect(resolvePath("/book/", "~/essays")).toBe("/essays/");
  });

  it("walks down from where it is", () => {
    expect(resolvePath("/", "book")).toBe("/book/");
    expect(resolvePath("/simulators/", "technical-debt/")).toBe("/simulators/technical-debt/");
  });

  it("walks up with .., and not above the root", () => {
    expect(resolvePath("/simulators/technical-debt/", "..")).toBe("/simulators/");
    expect(resolvePath("/book/", "../../..")).toBe("/");
    expect(resolvePath("/book/", "./")).toBe("/book/");
  });
});
