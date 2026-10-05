// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { KeptBlueprints } from "./KeptBlueprints";

describe("a reader's own version of a page's blueprints", () => {
  it("is kept in their browser, found again, and forgotten when asked", () => {
    const kept = new KeptBlueprints(() => window.localStorage);
    kept.set("/projects/blueprints/:1", "bars");
    expect(kept.get("/projects/blueprints/:1")).toBe("bars");
    kept.forget("/projects/blueprints/:1");
    expect(kept.get("/projects/blueprints/:1")).toBeNull();
  });

  it("is nothing, and breaks nothing, where storage is refused", () => {
    const refused = new KeptBlueprints(() => {
      throw new Error("SecurityError");
    });
    refused.set("a", "b");
    refused.forget("a");
    expect(refused.get("a")).toBeNull();
  });
});
