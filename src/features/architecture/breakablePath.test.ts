import { describe, expect, it } from "vitest";
import { breakablePath } from "./breakablePath";

describe("a path that wraps where a reader would break it", () => {
  it("may break after any slash, and nowhere else", () => {
    expect(breakablePath("features/architecture/browser/ArchitectureScene.ts")).toBe("features/<wbr>architecture/<wbr>browser/<wbr>ArchitectureScene.ts");
  });

  it("is still text, escaped", () => {
    expect(breakablePath("a<b>/c.ts")).toBe("a&lt;b&gt;/<wbr>c.ts");
  });
});
