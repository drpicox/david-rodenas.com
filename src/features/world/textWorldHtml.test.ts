import { describe, expect, it } from "vitest";
import { textWorldHtml } from "./textWorldHtml";

describe("textWorldHtml", () => {
  it("draws a cell with two colours as ▀ in the top one over the bottom one", () => {
    expect(textWorldHtml([[{ top: 12, bottom: 15 }]])).toBe('<span style="color:#ff5555;background:#ffffff">▀</span>');
  });

  it("draws a cell with one colour as the half-block that colour fills, over sky", () => {
    expect(textWorldHtml([[{ top: 1, bottom: -1 }]])).toBe('<span style="color:#0000aa">▀</span>');
    expect(textWorldHtml([[{ top: -1, bottom: 1 }]])).toBe('<span style="color:#0000aa">▄</span>');
  });

  it("draws a cell of one colour twice as █, and sky as a space, and rows as lines", () => {
    expect(textWorldHtml([[{ top: 2, bottom: 2 }], [{ top: -1, bottom: -1 }]])).toBe(
      '<span style="color:#00aa00">█</span>\n<span> </span>',
    );
  });
});
