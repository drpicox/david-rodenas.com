import type { Feature } from "../../platform/plugin/Feature";
import { mountStepNames } from "./browser/mountStepNames";
import { stepNamesStill } from "./stepNamesStill";

/** A sentence is a step, read as the name of a method the way the course's platform read it, and a post the test its steps make. */
export const stepNamesFeature: Feature = {
  name: "step-names",
  apps: { "step-names": mountStepNames },
  stills: { "step-names": stepNamesStill },
};
