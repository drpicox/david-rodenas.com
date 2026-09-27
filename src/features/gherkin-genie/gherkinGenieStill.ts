import type { Still } from "../../platform/plugin/Feature";
import { EXAMPLE_FEATURE } from "./EXAMPLE_FEATURE";
import { EXAMPLE_STEPS } from "./EXAMPLE_STEPS";
import { renderGenie } from "./renderGenie";

/** The example feature, its one written step, and the steps Gherkin Genie still wishes for, in the HTML before any script. */
export const gherkinGenieStill: Still = () => renderGenie(EXAMPLE_FEATURE, EXAMPLE_STEPS, false);
