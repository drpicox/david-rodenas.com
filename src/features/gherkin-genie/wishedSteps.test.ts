import { describe, expect, it } from "vitest";
import { readFeature } from "./readFeature";
import { wishedSteps } from "./wishedSteps";

const HELLO = `Feature: Hello World

    Scenario: Running a Gherkin test
        Given I am running a Gherkin test
        When I run the test
        Then I should see the Hello World`;

describe("the steps a feature still wishes for, printed the way Gherkin Genie prints them", () => {
  it("asks for every step with no method yet, named and ready to paste", () => {
    expect(wishedSteps(readFeature(HELLO), new Set())).toBe(`There are missing steps. Please implement them:

class WishedSteps {
  givenIAmRunningAGherkinTest() {
    throw new Error("Unimplemented");
  }

  whenIRunTheTest() {
    throw new Error("Unimplemented");
  }

  thenIShouldSeeTheHelloWorld() {
    throw new Error("Unimplemented");
  }
}`);
  });

  it("names the values it takes out, numbers and strings, then the doc string and the table", () => {
    const feature = `Scenario: All of it
  Given "John" has 3 "apples"
  Then the report says:
    """
    done
    """
  And the stock is:
    | name | price |`;
    const wished = wishedSteps(readFeature(feature), new Set());
    expect(wished).toContain("givenSHasNS(string1, number1, string2) {");
    expect(wished).toContain("thenTheReportSays(docString) {");
    expect(wished).toContain("andTheStockIs(table) {");
  });

  it("leaves out a step that has its method, whichever keyword the method was named with", () => {
    const feature = `Scenario: Cucumbers
  Given I have 12 cucumbers
  And I have 3 cucumbers
  When I eat 5 cucumbers`;
    const wished = wishedSteps(readFeature(feature), new Set(["IHaveNCucumbers"]));
    expect(wished).not.toContain("IHaveNCucumbers");
    expect(wished).toContain("whenIEatNCucumbers(number1) {");
  });

  it("asks for each step once, and for nothing when every step has its method", () => {
    const feature = `Scenario: Twice
  When I wait
  Then I wait`;
    expect(wishedSteps(readFeature(feature), new Set()).match(/IWait/g)).toHaveLength(1);
    expect(wishedSteps(readFeature(feature), new Set(["IWait"]))).toBe("");
  });
});
