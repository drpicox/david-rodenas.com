import type { Still } from "../plugin/Feature";
import { initialValues } from "./initialValues";
import type { Program } from "./Program";

/**
 * A program before any script runs: the line that asks for it, and what that
 * line answers. A reader with no script, a search engine and an agent reading
 * the page all see the figure, and see that it is a command.
 */
export function programStill(program: Program): Still {
  return () => `<p class="program-line"><code>$ ${program.name}</code></p><div class="program-figure">${program.run(initialValues(program)).html}</div>`;
}
