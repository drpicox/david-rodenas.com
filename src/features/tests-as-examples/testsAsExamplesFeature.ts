import type { Feature } from "../../platform/plugin/Feature";
import { mountTestsAsExamples } from "./browser/mountTestsAsExamples";
import { testsAsExamplesStill } from "./testsAsExamplesStill";

/** The tests of the 2018 essay on tests as documentation, run against a dispatcher refactored and one with a bug. */
export const testsAsExamplesFeature: Feature = {
  name: "tests-as-examples",
  apps: { "tests-as-examples": mountTestsAsExamples },
  stills: { "tests-as-examples": testsAsExamplesStill },
};
