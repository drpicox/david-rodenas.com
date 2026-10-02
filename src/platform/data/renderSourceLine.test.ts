import { describe, expect, it } from "vitest";
import { renderSourceLine } from "./renderSourceLine";

describe("the line under a figure that says whose data it is", () => {
  const index = { attribution: "Servei Meteorològic de Catalunya (XEMA).", dataset: "https://example.test/d/abcd", years: [1988, 1989, 2025], refreshed: "2026-09-20" };

  it("cites the source, links the dataset, and dates the copy — the terms the data is published under", () => {
    const html = renderSourceLine(index);
    expect(html).toContain("Servei Meteorològic de Catalunya (XEMA).");
    expect(html).toContain('<a href="https://example.test/d/abcd">');
    expect(html).toContain("1988 to 2025");
    expect(html).toContain("20 September 2026");
  });

  it("says, apart from the finished years, how far the year still running reaches", () => {
    expect(renderSourceLine(index, { year: 2026, through: "2026-09-28", refreshed: "2026-09-30" })).toContain("the finished years 1988 to 2025, and 2026 so far, to 28 September, last added to on 30 September 2026");
    expect(renderSourceLine(index, null)).toContain("the finished years 1988 to 2025, last added to");
  });

  it("does not let a name break the page", () => {
    expect(renderSourceLine({ ...index, attribution: "A <b> & co" })).toContain("A &lt;b&gt; &amp; co");
  });
});
