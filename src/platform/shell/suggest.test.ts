import { describe, expect, it } from "vitest";
import { suggest } from "./suggest";

describe("suggest", () => {
  it("offers the rest of the most recent line that began the same way", () => {
    expect(suggest("cd e", ["ls", "cd essays", "cd code"], [])).toBe("ssays");
    expect(suggest("cd c", ["cd essays", "cd code"], [])).toBe("ode");
  });

  it("falls back to what could be completed, in the shell's own order", () => {
    expect(suggest("c", [], ["cat", "cd", "clear"])).toBe("at");
  });

  it("offers help to an empty line, and nothing to a line that is already whole", () => {
    expect(suggest("", ["ls"], ["cat"])).toBe("help");
    expect(suggest("ls", ["ls"], ["ls"])).toBe("");
  });

  it("prefers what was typed before over what could be completed", () => {
    expect(suggest("c", ["cd worlds"], ["cat", "cd"])).toBe("d worlds");
  });
});
