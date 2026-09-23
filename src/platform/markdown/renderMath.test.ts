import { describe, expect, it } from "vitest";
import { renderMath } from "./renderMath";

describe("a formula, written where the prose is", () => {
  it("sets a name in italics, a word upright, a number as a number, and a sign as a sign", () => {
    const html = renderMath("m = fish + 2");
    expect(html).toContain("<mi>m</mi>");
    expect(html).toContain("<mi>fish</mi>");
    expect(html).toContain("<mn>2</mn>");
    expect(html).toContain("<mo>=</mo>");
    expect(html).toContain("<mo>+</mo>");
  });

  it("stacks a fraction, and groups what is above and below it in braces", () => {
    const html = renderMath("margin = frac{fish - money}{money}");
    expect(html).toContain("<mfrac><mrow><mi>fish</mi><mo>−</mo><mi>money</mi></mrow><mrow><mi>money</mi></mrow></mfrac>");
  });

  it("writes a sum with its limits under and over it, and a limit may be an expression", () => {
    const html = renderMath("sum_{m' >= m}^{n} p(m')");
    expect(html).toContain("<munderover><mo>∑</mo><mrow><mi>m</mi><mo>′</mo><mo>≥</mo><mi>m</mi></mrow><mrow><mi>n</mi></mrow></munderover>");
  });

  it("writes a subscript or a superscript on anything, and knows the signs a keyboard has not got", () => {
    expect(renderMath("x_i^2")).toContain("<msubsup><mi>x</mi><mrow><mi>i</mi></mrow><mrow><mn>2</mn></mrow></msubsup>");
    expect(renderMath("m^star")).toContain("<msup><mi>m</mi><mrow><mo>∗</mo></mrow></msup>");
    const signs = renderMath("a <= b != c -> inf * alpha ...");
    for (const sign of ["≤", "≠", "→", "∞", "·", "α", "…"]) expect(signs).toContain(sign);
  });

  it("keeps brackets with what is inside them, so they stretch to that and not to the fraction beside", () => {
    expect(renderMath("p(m) · frac{a}{b}")).toContain("<mrow><mo>(</mo><mi>m</mi><mo>)</mo></mrow>");
  });

  it("keeps a phrase as a phrase with text{}, and a word the notation knows as a word", () => {
    const html = renderMath("m^* = max { m : text{such that} }");
    expect(html).toContain("<mtext>such that</mtext>");
    expect(html).toContain("<mo>max</mo>");
  });

  it("is one displayed formula a line, and escapes what it does not understand rather than swallowing it", () => {
    const html = renderMath("a = 1\nb = <2>");
    expect(html.match(/<math display="block">/g)).toHaveLength(2);
    expect(html).toContain("<mo>&lt;</mo>");
    expect(html).not.toContain("<2>");
  });
});
