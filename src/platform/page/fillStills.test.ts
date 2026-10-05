import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../markdown/renderMarkdown";
import { fillStills } from "./fillStills";

describe("what a program's place holds before any script runs", () => {
  const page = renderMarkdown("Before.\n\n::no2\n\nAfter.\n\n::other");

  it("is written into the place the markdown made for the program", () => {
    const html = fillStills(page, (name) => (name === "no2" ? "<table>47</table>" : undefined));
    expect(html).toContain('<div class="app" data-app="no2"><table>47</table></div>');
  });

  it("hands the still the dials its place was given", () => {
    const small = renderMarkdown("::savings --rate");
    expect(fillStills(small, (name, dials) => `${name}: ${dials.join(",")}`)).toBe('<div class="app" data-app="savings" data-dials="rate">savings: rate</div>');
    expect(fillStills(page, (name, dials) => (name === "no2" ? `${dials.length}` : undefined))).toContain('data-app="no2">0</div>');
  });

  it("hands the still the lines its place was written with, as they were written", () => {
    const written = renderMarkdown('```::blueprint\nbars "Heat & cold"\n```');
    expect(fillStills(written, (_name, _dials, source) => `${source?.length}`)).toBe(written.replace("></div>", `>${'bars "Heat & cold"'.length}</div>`));
  });

  it("leaves a program that has no still exactly as it was", () => {
    const html = fillStills(page, () => undefined);
    expect(html).toBe(page);
  });

  it("would rather publish the page without the still than not publish the page", () => {
    const html = fillStills(page, () => {
      throw new Error("no data");
    });
    expect(html).toBe(page);
  });
});
