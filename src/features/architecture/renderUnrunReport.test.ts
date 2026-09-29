import { describe, expect, it } from "vitest";
import { renderUnrunReport } from "./renderUnrunReport";
import type { Unrun } from "./unrunOf";

const unrun: Unrun[] = [
  { path: "platform/p/lonely.ts", functions: [{ name: "lonely", line: 1 }], lines: [[2, 2]], asks: "unused" },
  { path: "features/f/browser/mountF.ts", functions: [{ name: "mountF", line: 3 }], lines: [[4, 9]], asks: "browser" },
  { path: "platform/p/used.ts", functions: [{ name: "used", line: 1 }], lines: [[2, 3], [5, 5]], asks: "unstated" },
];

describe("the report of what no test runs", () => {
  const report = renderUnrunReport(unrun);

  it("puts each file under the question it asks, with what to do about it", () => {
    expect(report).toMatch(/Nothing uses it[\s\S]*`src\/platform\/p\/lonely.ts`[\s\S]*Only a browser runs it[\s\S]*mountF[\s\S]*A behaviour no test states[\s\S]*`src\/platform\/p\/used.ts`/);
  });

  it("names the functions no test ran and the lines, and counts the lines of each file", () => {
    expect(report).toContain("- `src/platform/p/used.ts`: 3 lines — `used` (line 1); lines 2–3, 5");
  });

  it("says so when every line a test could run is run", () => {
    expect(renderUnrunReport([])).toContain("The tests run every line");
  });

  it("names the most in each question, and counts the rest", () => {
    const many = Array.from({ length: 5 }, (_, index): Unrun => ({ path: `platform/p/f${index}.ts`, functions: [], lines: [[1, 1]], asks: "unstated" }));
    expect(renderUnrunReport(many, 3)).toContain("and 2 more files");
  });
});
