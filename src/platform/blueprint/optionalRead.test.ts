import { describe, expect, it } from "vitest";
import { optionalRead } from "./optionalRead";
import { Pending } from "./Pending";

describe("a file that may not be there", () => {
  it("is read when it is there", () => {
    expect(optionalRead(() => "{}", "/data/x.json")).toBe("{}");
  });

  it("is nothing when it is not", () => {
    expect(
      optionalRead(() => {
        throw new Error("404");
      }, "/data/x.json"),
    ).toBeNull();
  });

  it("is waited for while it is on its way", () => {
    expect(() =>
      optionalRead((path) => {
        throw new Pending(path);
      }, "/data/x.json"),
    ).toThrow(Pending);
  });
});
