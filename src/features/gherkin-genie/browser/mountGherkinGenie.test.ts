// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mountGherkinGenie } from "./mountGherkinGenie";

function mounted(): HTMLElement {
  const host = document.createElement("div");
  mountGherkinGenie(host);
  return host;
}

function type(field: HTMLTextAreaElement, value: string): void {
  field.value = value;
  field.dispatchEvent(new Event("input"));
}

describe("Gherkin Genie, in the page", () => {
  it("starts with a feature and one step written, and prints the steps still wished for", () => {
    const host = mounted();
    expect(host.querySelector<HTMLTextAreaElement>('[data-genie="feature"]')?.value).toContain("Given I have 12 cucumbers");
    expect(host.querySelector(".genie-wished")?.textContent).toContain("whenIEatNCucumbers(number1)");
  });

  it("runs the scenario once the wished methods are written, and says it passes", () => {
    const host = mounted();
    type(
      host.querySelector<HTMLTextAreaElement>('[data-genie="steps"]')!,
      `class CucumberSteps {
  #count = 0;
  givenIHaveNCucumbers(count) { this.#count = count; }
  whenIEatNCucumbers(eaten) { this.#count -= eaten; }
  thenIShouldHaveNCucumbersRemaining(left) { expect(this.#count).toBe(left); }
}`,
    );
    expect(host.querySelector(".kata-bar")?.textContent).toBe("Every scenario passes.");
  });

  it("colours what is typed as it is typed", () => {
    const host = mounted();
    const steps = host.querySelector<HTMLTextAreaElement>('[data-genie="steps"]')!;
    type(steps, "class Steps {}");
    expect(steps.previousElementSibling?.innerHTML).toContain('<span class="hl-k">class</span> Steps {}');
  });

  it("asks again as soon as the feature gains a step", () => {
    const host = mounted();
    const feature = host.querySelector<HTMLTextAreaElement>('[data-genie="feature"]')!;
    type(feature, `${feature.value}\n    And the jar should be empty`);
    expect(host.querySelector(".genie-wished")?.textContent).toContain("andTheJarShouldBeEmpty()");
  });
});
