import type { Still } from "../../platform/plugin/Feature";
import { renderKataFiveSteps } from "./renderKataFiveSteps";

/** Every step of the refactor in the HTML before any script, the last one shown. */
export const kataFiveStepsStill: Still = () => renderKataFiveSteps();
