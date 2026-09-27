import { describe, expect, it } from "vitest";
import { runGenie } from "./runGenie";

const CUCUMBERS = `Feature: Magic of Disappearing Cucumbers

  Scenario: Eating 5 out of 12 cucumbers
    Given I have 12 cucumbers
    When I eat 5 cucumbers
    Then I should have 7 cucumbers remaining`;

const steps = (eat: string) => `class CucumberSteps {
  #count = 0;

  givenIHaveNCucumbers(count) {
    this.#count = count;
  }

  whenIEatNCucumbers(eaten) {
    ${eat}
  }

  thenIShouldHaveNCucumbersRemaining(left) {
    expect(this.#count).toBe(left);
  }
}`;

describe("a feature, its steps, and what Gherkin Genie makes of them", () => {
  it("asks for the steps that have no method yet, and runs nothing", () => {
    const run = runGenie(CUCUMBERS, "class CucumberSteps {\n  givenIHaveNCucumbers(count) {}\n}");
    expect(run.wished).toContain("whenIEatNCucumbers(number1) {");
    expect(run.wished).not.toContain("givenIHaveNCucumbers");
    expect(run.run).toBeUndefined();
  });

  it("runs each scenario as a test once every step has its method", () => {
    const run = runGenie(CUCUMBERS, steps("this.#count -= eaten;"));
    expect(run.wished).toBe("");
    expect(run.run).toMatchObject({ passed: true, results: [{ name: "Eating 5 out of 12 cucumbers", passed: true }] });
  });

  it("says what failed, the way the test runner says it", () => {
    expect(runGenie(CUCUMBERS, steps("this.#count -= eaten - 1;")).run?.message).toBe("Expected: 7. Received: 8.");
  });

  it("hands a step its table as a list of rows, each named by the header", () => {
    const feature = `Scenario: Stock
  Given the products:
    | name  | price |
    | apple | 1     |`;
    const shop = `class ShopSteps {
  givenTheProducts(table) {
    expect(table[0].name).toBe("apple");
  }
}`;
    expect(runGenie(feature, shop).run?.passed).toBe(true);
  });

  it("says so when the steps are not a class it can read", () => {
    expect(runGenie(CUCUMBERS, "class {").error).toMatch(/^SyntaxError/);
    expect(runGenie(CUCUMBERS, "42").error).toBe("The steps must be a class.");
  });
});
