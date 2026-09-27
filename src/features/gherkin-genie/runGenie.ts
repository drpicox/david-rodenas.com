import { reported } from "../../platform/testing/reported";
import { runTestFile } from "../../platform/testing/runTestFile";
import type { TestRun } from "../../platform/testing/TestRun";
import { genieStepOf } from "./genieStepOf";
import { readFeature } from "./readFeature";
import { wishedSteps } from "./wishedSteps";

/** What came of a feature and its steps: the steps still wished for, or the scenarios run, or why neither could be. */
export interface GenieRun {
  readonly wished: string;
  readonly run?: TestRun;
  readonly error?: string;
}

/** Gherkin Genie's rule: a method is a step if its name starts with a keyword, and the keyword is not part of what it matches. */
const KEYWORD = /^(given|when|then|and|but)([A-Z])/;

const valueOf = (value: unknown) => JSON.stringify(value);

/** A table reaches its step as rows, each one an object named by the header. */
function rowsOf(table: readonly (readonly string[])[]): Record<string, string>[] {
  const [header = [], ...rows] = table;
  return rows.map((row) => Object.fromEntries(header.map((name, index) => [name, row[index] ?? ""])));
}

/**
 * A feature and a class of steps, as Gherkin Genie would take them: the
 * class's methods are read off its prototype; if a step has none, what is
 * printed is the methods to write; if every step has one, each scenario runs
 * as a test, a fresh instance each, one call a step with the values its
 * sentence carried.
 */
export function runGenie(featureText: string, stepsSource: string): GenieRun {
  const source = stepsSource.trim().replace(/;+$/, "");
  let Steps: unknown;
  try {
    Steps = new Function(`return (${source});`)();
  } catch (error) {
    return { wished: "", error: reported(error) };
  }
  if (typeof Steps !== "function") return { wished: "", error: "The steps must be a class." };

  const methods = new Map<string, string>();
  for (const name of Object.getOwnPropertyNames((Steps as { prototype: object }).prototype)) {
    if (KEYWORD.test(name)) methods.set(name.replace(KEYWORD, "$2"), name);
  }
  const scenarios = readFeature(featureText);
  const wished = wishedSteps(scenarios, new Set(methods.keys()));
  if (wished) return { wished };

  const tests = scenarios.map((scenario) => {
    const calls = scenario.steps.map((step) => {
      const { matchName, args } = genieStepOf(step.text);
      const values = [...args.map(valueOf), ...(step.docString === undefined ? [] : [valueOf(step.docString)]), ...(step.table ? [valueOf(rowsOf(step.table))] : [])];
      return `  steps[${valueOf(methods.get(matchName))}](${values.join(", ")});`;
    });
    return `test(${valueOf(scenario.name)}, () => {\n  const steps = new Steps();\n${calls.join("\n")}\n});`;
  });
  return { wished: "", run: runTestFile(`const Steps = (${source});\n${tests.join("\n")}`) };
}
