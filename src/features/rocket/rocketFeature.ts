import type { Feature } from "../../platform/plugin/Feature";
import { mountRocket } from "./browser/mountRocket";
import { rocketProgram } from "./rocketProgram";

/**
 * The relativistic rocket: how long a trip takes on board and at home, and
 * what it burns. A program, so a command and a tool; on its page it stands
 * under a map of the stars, which is why it brings an app of its own.
 */
export const rocketFeature: Feature = {
  name: "rocket",
  programs: [rocketProgram],
  apps: { rocket: mountRocket },
};
