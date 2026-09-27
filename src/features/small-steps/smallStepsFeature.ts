import type { Feature } from "../../platform/plugin/Feature";
import { mountSmallSteps } from "./browser/mountSmallSteps";
import { smallStepsStill } from "./smallStepsStill";

/** Small, safe steps as a row that fills: a test in red, put right at once, clean steps between, over and over. */
export const smallStepsFeature: Feature = {
  name: "small-steps",
  apps: { "small-steps": mountSmallSteps },
  stills: { "small-steps": smallStepsStill },
};
