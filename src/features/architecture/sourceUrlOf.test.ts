import { describe, expect, it } from "vitest";
import { sourceUrlOf } from "./sourceUrlOf";

describe("where a file or a box is, on GitHub, as it stood at a commit", () => {
  it("points a file at its source at that commit", () => {
    expect(sourceUrlOf("7430145", "features/rocket/rocketFeature.ts")).toBe("https://github.com/drpicox/david-rodenas.com/blob/7430145/src/features/rocket/rocketFeature.ts");
  });

  it("points a box at its folder, and a box that is one file at the file", () => {
    expect(sourceUrlOf("7430145", "platform/shell", "box")).toBe("https://github.com/drpicox/david-rodenas.com/tree/7430145/src/platform/shell");
    expect(sourceUrlOf("7430145", "main.ts", "box")).toBe("https://github.com/drpicox/david-rodenas.com/blob/7430145/src/main.ts");
  });
});
