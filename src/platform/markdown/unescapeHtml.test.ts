import { describe, expect, it } from "vitest";
import { escapeHtml } from "./escapeHtml";
import { unescapeHtml } from "./unescapeHtml";

describe("what was escaped, read back", () => {
  it("is what was escaped, whatever it held", () => {
    const text = 'bars "Heat & <cold>" table: heat';
    expect(unescapeHtml(escapeHtml(text))).toBe(text);
  });

  it("reads an ampersand once, not twice", () => {
    expect(unescapeHtml("&amp;lt;")).toBe("&lt;");
  });
});
