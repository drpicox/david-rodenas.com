import { describe, expect, it } from "vitest";
import { readFeature } from "./readFeature";

describe("a feature file, read for its scenarios and their steps", () => {
  it("reads each scenario with its steps, keyword and sentence apart", () => {
    const feature = `Feature: Hello World

  Scenario: Running a Gherkin test
    Given I am running a Gherkin test
    When I run the test
    Then I should see the Hello World`;
    expect(readFeature(feature)).toEqual([
      {
        name: "Running a Gherkin test",
        steps: [
          { keyword: "Given", text: "I am running a Gherkin test" },
          { keyword: "When", text: "I run the test" },
          { keyword: "Then", text: "I should see the Hello World" },
        ],
      },
    ]);
  });

  it("puts the background's steps before every scenario's own, and skips comments and tags", () => {
    const feature = `Feature: Cucumbers
  # a comment
  Background:
    Given I have 12 cucumbers

  @tag
  Scenario: Eating
    When I eat 5 cucumbers
  Scenario: Not eating
    Then I should have 12 cucumbers remaining`;
    const scenarios = readFeature(feature);
    expect(scenarios.map((scenario) => scenario.steps.map((step) => step.text))).toEqual([
      ["I have 12 cucumbers", "I eat 5 cucumbers"],
      ["I have 12 cucumbers", "I should have 12 cucumbers remaining"],
    ]);
  });

  it("gives a step the table under it, and the doc string", () => {
    const feature = `Feature: Shop
  Scenario: Stock
    Given the products:
      | name  | price |
      | apple | 1     |
    Then the note says:
      """
      Two lines
      of note
      """`;
    const [stock] = readFeature(feature);
    expect(stock?.steps[0]?.table).toEqual([
      ["name", "price"],
      ["apple", "1"],
    ]);
    expect(stock?.steps[1]?.docString).toBe("Two lines\nof note");
  });

  it("keeps a doc string's own indentation, counted from its opening quotes", () => {
    const feature = ["Scenario: Code", "  Given the code:", '    """', "    if (ok) {", "      go();", "    }", '    """'].join("\n");
    expect(readFeature(feature)[0]?.steps[0]?.docString).toBe("if (ok) {\n  go();\n}");
  });
});
