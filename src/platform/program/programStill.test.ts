import { describe, expect, it } from "vitest";
import { aProgram } from "./aProgram";
import { programStill } from "./programStill";

describe("a program before any script runs", () => {
  it("is the line that asks for it, and what that line answers", () => {
    expect(programStill(aProgram)(() => "", [])).toBe('<p class="program-line"><code>$ savings</code></p><div class="program-figure"><p><strong>121</strong> €</p></div>');
  });

  it("is only its glance, where a page shows it small", () => {
    expect(programStill(aProgram)(() => "", ["years"])).toBe('<p class="program-line"><code>$ savings</code></p><div class="program-figure glance"><strong>121</strong></div>');
  });
});
