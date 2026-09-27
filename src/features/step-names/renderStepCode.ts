import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { highlight } from "../../platform/markdown/highlight";
import type { StepMethod } from "./StepMethod";
import { stepMethodOf } from "./stepMethodOf";

const block = (title: string, language: string, code: string, className: string) =>
  `<div class="${className}"><h4>${escapeHtml(title)}</h4><pre><code>${highlight(code, language)}</code></pre></div>`;

/** The calls, each followed by the sentence it came from, the comments lined up. */
function calls(steps: readonly StepMethod[]): string {
  const lines = steps.map((step) => `context.${step.name}(${step.arguments.map((argument) => argument.value).join(", ")});`);
  const width = Math.max(0, ...lines.map((line) => line.length));
  return lines.map((line, index) => `  ${line.padEnd(width)}  // ${steps[index]?.text.trim()}`).join("\n");
}

/** Each method once, in the order it was first asked for. */
function unique(steps: readonly StepMethod[]): StepMethod[] {
  const seen = new Set<string>();
  return steps.filter((step) => !seen.has(step.name) && seen.add(step.name));
}

/**
 * What a post becomes: the same test in Java for the server and in
 * JavaScript for the client, one call a sentence, and the methods still to
 * write — which are the work. The sentence stays beside its call, so a
 * failing line says, in the student's own words, what did not happen.
 */
export function renderStepCode(lines: readonly string[]): string {
  const steps = lines.map(stepMethodOf).filter((step) => step.name.length > 0);
  const java = `@Test\npublic void post() {\n${calls(steps)}\n}`;
  const js = `test("post", () => {\n${calls(steps)}\n});`;
  const javaContext = unique(steps)
    .map((step) => `public void ${step.name}(${step.arguments.map((argument) => `${argument.type} ${argument.name}`).join(", ")}) {\n  // to write\n}`)
    .join("\n\n");
  const jsContext = unique(steps)
    .map((step) => `${step.name}(${step.arguments.map((argument) => argument.name).join(", ")}) {\n  // to write\n}`)
    .join("\n\n");
  return (
    `<div class="step-code">` +
    block("The test, for the server", "java", java, "step-test") +
    block("The test, for the client", "js", js, "step-test") +
    block("What is left to write, in Java", "java", javaContext, "step-context") +
    block("And in JavaScript", "js", jsContext, "step-context") +
    `</div>`
  );
}
