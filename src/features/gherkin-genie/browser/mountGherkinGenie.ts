import { highlight } from "../../../platform/markdown/highlight";
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
  // Each file's coloured copy lies under it: it follows every keystroke and every scroll.
  for (const field of [feature, steps]) {
    const colours = field.previousElementSibling as HTMLElement | null;
    const colour = () => {
      if (colours) colours.innerHTML = `<code>${highlight(field.value, field.dataset["language"] ?? "")}\n</code>`;
    };
    field.addEventListener("input", colour);
    field.addEventListener("scroll", () => {
      if (colours) {
        colours.scrollTop = field.scrollTop;
        colours.scrollLeft = field.scrollLeft;
      }
    });
  }
  const draw = () => {
    output.innerHTML = renderGenieRun(runGenie(feature.value, steps.value));
  };
  feature.addEventListener("input", draw);
  steps.addEventListener("input", draw);
}
