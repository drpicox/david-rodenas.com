import { describe, expect, it } from "vitest";
import { NextWordModel } from "./NextWordModel";
import { renderNextWord } from "./renderNextWord";

const model = new NextWordModel("the cat sleeps. the cat eats. the dog sleeps. a <b> dog barks.", 1);

describe("the model, shown thinking", () => {
  it("shows the text so far, with the words it is looking back at marked", () => {
    const html = renderNextWord(model, ["a", "dog"], 1);
    expect(html).toContain('a <mark>dog</mark>');
  });

  it("offers what may come next with the chance of each, as something to press", () => {
    const html = renderNextWord(model, ["the"], 1);
    expect(html).toMatch(/data-word="cat"[^>]*>.*cat.*67%/s);
    expect(html).toMatch(/data-word="dog"[^>]*>.*dog.*33%/s);
  });

  it("shows what the temperature did to the chances, next to what was learnt", () => {
    const html = renderNextWord(model, ["the"], 0.5);
    expect(html).toContain("80%");
    expect(html).toContain("seen 2 of 3 times");
  });

  it("lists what it learnt, with what applies now first and marked", () => {
    const html = renderNextWord(model, ["the"], 1);
    const rows = html.slice(html.indexOf("<tbody>"));
    expect(rows.indexOf('class="now"')).toBeLessThan(rows.indexOf("<tr>"));
    expect(rows.match(/class="now"/g)).toHaveLength(2);
  });

  it("says so when there is nothing it could say next", () => {
    expect(renderNextWord(new NextWordModel("hello", 1), ["hello"], 1)).toContain("never saw anything follow");
  });
});
