import type { Feature } from "../../platform/plugin/Feature";
import { mountStepNames } from "./browser/mountStepNames";
import { stepNamesStill } from "./stepNamesStill";

/** The post is the test, and each of its sentences a step, read as a method's name the way the course's platform read them. */
export const stepNamesFeature: Feature = {
  name: "step-names",
  apps: { "step-names": mountStepNames },
  stills: { "step-names": stepNamesStill },
};
