import type { Feature } from "../../platform/plugin/Feature";
import { mountRocket } from "./browser/mountRocket";
import { rocketStill } from "./rocketStill";

/** The relativistic rocket: how long a trip takes on board and at home, and what it burns. */
export const rocketFeature: Feature = {
  name: "rocket",
  apps: { rocket: mountRocket },
  stills: { rocket: rocketStill },
};
