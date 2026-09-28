import { describe, expect, it } from "vitest";
import { EXAMPLE_FEATURE } from "./EXAMPLE_FEATURE";
import { EXAMPLE_STEPS } from "./EXAMPLE_STEPS";
import { renderGenie } from "./renderGenie";

describe("the feature and its steps, beside what Gherkin Genie makes of them", () => {
  it("colours both files before any script: the feature as Gherkin, the steps as JavaScript", () => {
    const html = renderGenie(EXAMPLE_FEATURE, EXAMPLE_STEPS, false);
    expect(html).toContain('<span class="hl-k">Feature:</span> Magic of Disappearing Cucumbers');
    expect(html).toContain('<span class="hl-k">class</span> CucumberSteps {');
    expect(html).not.toContain("<textarea");
  });

  it("lays each file to edit over its coloured copy, so what is typed is coloured too", () => {
    const html = renderGenie(EXAMPLE_FEATURE, EXAMPLE_STEPS, true);
    expect(html).toMatch(/<div class="genie-editor"><pre class="genie-source genie-colours" aria-hidden="true"><code>[^]*<span class="hl-k">Feature:<\/span>[^]*<\/code><\/pre><textarea class="genie-source" data-genie="feature"/);
  });
});
