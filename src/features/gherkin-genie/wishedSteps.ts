import { genieStepOf } from "./genieStepOf";
import type { FeatureScenario } from "./readFeature";

/**
 * What Gherkin Genie prints when a feature has steps with no method — its
 * `verifySteps`, in JavaScript: each one once, named after its own keyword
 * and its sentence, with a parameter for each value taken out of it, ready to
 * be pasted into the steps and filled in. Empty when nothing is missing.
 */
export function wishedSteps(scenarios: readonly FeatureScenario[], written: ReadonlySet<string>): string {
  const known = new Set(written);
  const missing: string[] = [];
  for (const step of scenarios.flatMap((scenario) => scenario.steps)) {
    const { matchName, args } = genieStepOf(step.text);
    if (known.has(matchName)) continue;
    let numbers = 1;
    let strings = 1;
    const parameters = args.map((arg) => (typeof arg === "number" ? `number${numbers++}` : `string${strings++}`));
    if (step.docString !== undefined) parameters.push("docString");
    if (step.table) parameters.push("table");
    missing.push(`  ${step.keyword.toLowerCase()}${matchName}(${parameters.join(", ")}) {\n    throw new Error("Unimplemented");\n  }`);
    known.add(matchName);
  }
  if (missing.length === 0) return "";
  return ["There are missing steps. Please implement them:", "", "class WishedSteps {", missing.join("\n\n"), "}"].join("\n");
}
