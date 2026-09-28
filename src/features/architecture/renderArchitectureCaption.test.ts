import { describe, expect, it } from "vitest";
import { renderArchitectureCaption } from "./renderArchitectureCaption";

describe("the caption under the picture", () => {
  it("names the commit, and links it to where its changes can be read on GitHub", () => {
    const html = renderArchitectureCaption(
      { sha: "7430145", date: "2026-09-27T23:20:56+02:00", subject: "craft/kata: lessons" },
      { files: 3, boxes: 2, tests: 1, crossing: 1, typeOnly: 0, arrows: 2, tested: 1, testable: 2, inCycles: 0 } as never,
    );
    expect(html).toContain('<a href="https://github.com/drpicox/david-rodenas.com/commit/7430145" target="_blank" rel="noopener noreferrer"><code>7430145</code></a>');
  });
});
