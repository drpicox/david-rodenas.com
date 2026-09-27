import { EXAMPLE_FEATURE } from "../EXAMPLE_FEATURE";
import { EXAMPLE_STEPS } from "../EXAMPLE_STEPS";
import { renderGenie } from "../renderGenie";
import { renderGenieRun } from "../renderGenieRun";
import { runGenie } from "../runGenie";

/** The feature and its steps to edit, and what Gherkin Genie says of them, said again as they are typed. */
export function mountGherkinGenie(host: HTMLElement): void {
  host.innerHTML = renderGenie(EXAMPLE_FEATURE, EXAMPLE_STEPS, true);
  const feature = host.querySelector<HTMLTextAreaElement>('[data-genie="feature"]');
  const steps = host.querySelector<HTMLTextAreaElement>('[data-genie="steps"]');
  const output = host.querySelector<HTMLElement>(".genie-output");
  if (!feature || !steps || !output) return;
  const draw = () => {
    output.innerHTML = renderGenieRun(runGenie(feature.value, steps.value));
  };
  feature.addEventListener("input", draw);
  steps.addEventListener("input", draw);
}
