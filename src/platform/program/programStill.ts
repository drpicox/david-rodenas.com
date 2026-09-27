import type { Still } from "../plugin/Feature";
import { initialValues } from "./initialValues";
import type { Program } from "./Program";

/**
 * A program before any script runs: the line that asks for it, and what that
 * line answers. A reader with no script, a search engine and an agent reading
 * the page all see the figure, and see that it is a command.
 */
export function programStill(program: Program): Still {
  return (_read, dials) => {
    const values = initialValues(program);
    const small = dials.length > 0 && program.glance;
    const figure = small ? `<div class="program-figure glance">${program.glance?.(values)}</div>` : `<div class="program-figure">${program.run(values).html}</div>`;
    return `<p class="program-line"><code>$ ${program.name}</code></p>${figure}`;
  };
}
