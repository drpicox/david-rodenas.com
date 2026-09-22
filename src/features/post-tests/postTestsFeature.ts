import type { Feature } from "../../platform/plugin/Feature";
import { mountPostTests } from "./browser/mountPostTests";
import { postTestsStill } from "./postTestsStill";

/** A blog post compiled into its test, live: the mechanism of the 2017–2022 software lab, with its rules. */
export const postTestsFeature: Feature = {
  name: "post-tests",
  apps: { "post-tests": mountPostTests },
  stills: { "post-tests": postTestsStill },
};
