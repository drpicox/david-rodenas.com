import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../markdown/renderMarkdown";
import type { Still } from "../plugin/Feature";
import { fillStills } from "./fillStills";

/**
 * A program's place is written by the markdown, filled by the build, and
 * drawn by a still a feature brings, and the three agree on what a place
 * hands over — its name, its dials, the lines it was written with — with no
 * import to say so: the markdown writes attributes, the build reads them back
 * out of the page. This is that agreement, where breaking it fails.
 */
describe("a program's place, from the markdown to its still", () => {
  const still: Still = (_read, dials, source) => `[${dials.join(",")}|${source ?? "no source"}]`;
  const filled = (markdown: string) => fillStills(renderMarkdown(markdown), (name, dials, source) => (name === "blueprint" ? still(() => "", dials, source) : undefined));

  it("hands the still a line's dials, and no source", () => {
    expect(filled("::blueprint --open")).toContain("[open|no source]");
  });

  it("hands the still a fenced block's lines exactly as they were written, quotes, ampersands and all", () => {
    const lines = 'heat = weather-months "Heat & <cold>" station: D5\nbars table: heat';
    expect(filled(`\`\`\`::blueprint --open\n${lines}\n\`\`\``)).toContain(`>[open|${lines}]</div>`);
  });
});
