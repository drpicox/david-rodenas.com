import type { Feature } from "../../platform/plugin/Feature";
import { mountGherkinGenie } from "./browser/mountGherkinGenie";
import { gherkinGenieStill } from "./gherkinGenieStill";

/** Gherkin Genie in the page: write a scenario, see the steps it wishes for, write them, and see it run. */
export const gherkinGenieFeature: Feature = {
  name: "gherkin-genie",
  apps: { "gherkin-genie": mountGherkinGenie },
  stills: { "gherkin-genie": gherkinGenieStill },
};
