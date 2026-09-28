import { describe, expect, it } from "vitest";
import { joinedBy } from "./joinedBy";

// 2 needs 3, 3 needs 1; 0 and 4 stand alone.
const LINKS: [number, number][] = [[2, 3], [3, 1]];

describe("what joins two files in the source", () => {
  it("is an arrow, either way; arrows through other files; or nothing at all", () => {
    expect(joinedBy(LINKS, 2, 3)).toBe("arrow");
    expect(joinedBy(LINKS, 3, 2)).toBe("arrow");
    expect(joinedBy(LINKS, 1, 2)).toBe("through");
    expect(joinedBy(LINKS, 0, 1)).toBe("none");
  });
});
