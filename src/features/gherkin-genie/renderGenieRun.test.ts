import { describe, expect, it } from "vitest";
import { EXAMPLE_FEATURE } from "./EXAMPLE_FEATURE";
import { EXAMPLE_STEPS } from "./EXAMPLE_STEPS";
import { renderGenieRun } from "./renderGenieRun";
import { runGenie } from "./runGenie";

describe("what the page shows of a run", () => {
  it("prints the wished steps as they are, to be copied, the code coloured as code", () => {
    const html = renderGenieRun(runGenie(EXAMPLE_FEATURE, EXAMPLE_STEPS));
    expect(html).toContain('<pre class="genie-wished">There are missing steps. Please implement them:');
    expect(html).toContain('<span class="hl-k">class</span> WishedSteps {');
    expect(html).toContain('<span class="hl-k">throw</span> <span class="hl-k">new</span> Error(<span class="hl-s">&quot;Unimplemented&quot;</span>);');
  });

  it("shows each scenario green or red once it runs, with what the runner said", () => {
    const html = renderGenieRun({ wished: "", run: { passed: false, message: "Expected: 7. Received: 8.", results: [{ name: "Eating", passed: false, message: "Expected: 7. Received: 8." }] } });
    expect(html).toContain('<p class="kata-bar red">Expected: 7. Received: 8.</p>');
    expect(html).toMatch(/<li class="red"><code>Eating<\/code><span class="said">Expected: 7\. Received: 8\.<\/span><\/li>/);
    expect(renderGenieRun({ wished: "", run: { passed: true, results: [{ name: "Eating", passed: true }] } })).toContain('<p class="kata-bar green">Every scenario passes.</p>');
  });

  it("says why nothing could run when the steps cannot be read", () => {
    expect(renderGenieRun({ wished: "", error: "The steps must be a class." })).toContain('<p class="kata-bar red">The steps must be a class.</p>');
  });
});
