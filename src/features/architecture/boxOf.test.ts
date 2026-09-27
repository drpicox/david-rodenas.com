import { describe, expect, it } from "vitest";
import { boxOf } from "./boxOf";

describe("the box a file stands in", () => {
  it("is its module: a folder of the frame, or a feature", () => {
    expect(boxOf("platform/shell/commands/ls.ts")).toBe("platform/shell");
    expect(boxOf("features/rocket/browser/mountRocket.ts")).toBe("features/rocket");
  });

  it("is the file itself, for one that stands alone at a level: the composition root, the list of features", () => {
    expect(boxOf("main.ts")).toBe("main.ts");
    expect(boxOf("features/allFeatures.ts")).toBe("features/allFeatures.ts");
  });
});
