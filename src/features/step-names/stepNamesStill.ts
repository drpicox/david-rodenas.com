import type { Still } from "../../platform/plugin/Feature";
import { EXAMPLE_POST } from "./EXAMPLE_POST";
import { renderStepCode } from "./renderStepCode";

/** The course's example post and the tests it becomes, in the HTML before any script. */
export const stepNamesStill: Still = () => `<pre class="step-post">${EXAMPLE_POST.map((line) => `* ${line}`).join("\n")}</pre>${renderStepCode(EXAMPLE_POST)}`;
