import { describe, expect, it } from "vitest";
import { renderPackages } from "./renderPackages";

const downloads = {
  years: {
    "2023": { "async-barrier": 100, "string-cache-map": 1000, "drpx-seo": 5, ngtags: 7 },
    "2024": { "async-barrier": 300, "string-cache-map": 500, "drpx-seo": 5 },
  },
};

describe("what strangers installed", () => {
  const html = renderPackages(downloads);

  it("gives a row to each package worth describing, the most downloaded first, with its total", () => {
    expect(html.indexOf("string-cache-map")).toBeLessThan(html.indexOf("async-barrier"));
    expect(html).toMatch(/string-cache-map.*1,500/s);
    expect(html).toContain("https://www.npmjs.com/package/async-barrier");
  });

  it("counts all the others together rather than pretending they matter one by one", () => {
    expect(html).toMatch(/the other 2.*17/s);
  });

  it("draws each row's years as bars, and says what each bar is", () => {
    expect(html).toContain("<title>2023: 1,000</title>");
    // Two with a line of their own, the others together, and all of them.
    expect(html.match(/<svg class="spark"/g)).toHaveLength(4);
  });

  it("adds everything up, and says which years", () => {
    expect(html).toContain("2023 to 2024");
    expect(html).toMatch(/all of them.*1,917/s);
  });
});
