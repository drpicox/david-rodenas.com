import { describe, expect, it } from "vitest";
import { coverageOf } from "./coverageOf";

describe("how much of each file the tests run", () => {
  it("is the share of its lines, by its path under src, read off the summary vitest writes", () => {
    const summary = {
      total: { lines: { pct: 80 } },
      "/repo/src/platform/shell/Shell.ts": { lines: { pct: 96.5 } },
      "/repo/src/main.ts": { lines: { pct: 0 } },
      "/repo/tools/elsewhere.ts": { lines: { pct: 50 } },
    };
    expect(coverageOf(summary, "/repo/src", "abc1234")).toEqual({ sha: "abc1234", lines: { "platform/shell/Shell.ts": 96.5, "main.ts": 0 } });
  });
});
