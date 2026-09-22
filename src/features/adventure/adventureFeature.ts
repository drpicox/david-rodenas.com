import type { Feature } from "../../platform/plugin/Feature";
import { adventureStill } from "./adventureStill";
import { mountAdventure } from "./browser/mountAdventure";

/** The text adventure of a first-year lab, 2007: sixty-four rooms on an eight-by-eight map, playable. */
export const adventureFeature: Feature = {
  name: "adventure",
  apps: { adventure: mountAdventure },
  stills: { adventure: adventureStill },
};
