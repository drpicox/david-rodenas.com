import { describe, expect, it } from "vitest";
import { tableMarkup } from "./tableMarkup";

const table = {
  columns: [
    { name: "file", kind: "text" as const },
    { name: "needed", kind: "number" as const, unit: "files" },
  ],
  rows: [
    { file: "platform/plugin/Feature.ts", needed: 58 },
    { file: "platform/browser/el.ts", needed: 37.25 },
    { file: "<script>", needed: null },
  ],
};

describe("a table, as a table", () => {
  const html = tableMarkup(table, 2).html;

  it("names its columns, with their units, and right-aligns the numbers", () => {
    expect(html).toContain('<th class="number">needed<span class="unit"> files</span></th>');
  });

  it("shows its first rows, numbers as they would be read, and says how many more there are", () => {
    expect(html).toContain('<td class="number">37.25</td>');
    expect(html).toContain("and 1 row more");
    expect(html).not.toContain("script");
  });

  it("escapes what it shows, and leaves empty what holds nothing", () => {
    const all = tableMarkup(table, 10).html;
    expect(all).toContain("&lt;script&gt;");
    expect(all).toContain('<td class="number"></td>');
  });
});
