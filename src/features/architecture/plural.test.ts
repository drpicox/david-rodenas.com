import { describe, expect, it } from "vitest";
import { plural } from "./plural";

describe("a count with its noun", () => {
  it("says one thing, and many, the way English does", () => {
    expect([plural(1, "file"), plural(0, "file"), plural(2, "box", "boxes")]).toEqual(["1 file", "0 files", "2 boxes"]);
  });
});
