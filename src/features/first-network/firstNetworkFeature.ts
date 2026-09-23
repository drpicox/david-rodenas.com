import type { Feature } from "../../platform/plugin/Feature";
import { mountLetters } from "./browser/mountLetters";
import { mountRobot } from "./browser/mountRobot";
import { lettersStill } from "./lettersStill";
import { robotStill } from "./robotStill";

/** The first network: letters told apart by backpropagation, and the robot of 1995 that learnt to look for the light. */
export const firstNetworkFeature: Feature = {
  name: "first-network",
  apps: { letters: mountLetters, "light-robot": mountRobot },
  stills: { letters: lettersStill, "light-robot": robotStill },
};
