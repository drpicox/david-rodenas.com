import type { Feature } from "../../platform/plugin/Feature";
import { mountLagoon } from "./browser/mountLagoon";
import { lagoonStill } from "./lagoonStill";

/** The fishing lagoon of the LS1 lab: a commons that breeds, the bots that share it, and a seat for the visitor's own. */
export const lagoonFeature: Feature = {
  name: "lagoon",
  apps: { lagoon: mountLagoon },
  stills: { lagoon: lagoonStill },
};
