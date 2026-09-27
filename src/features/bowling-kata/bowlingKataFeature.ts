import type { Feature } from "../../platform/plugin/Feature";
import { bowlingKataStill } from "./bowlingKataStill";
import { mountBowlingKata } from "./browser/mountBowlingKata";
import { mountKataFiveSteps } from "./browser/mountKataFiveSteps";
import { kataFiveStepsStill } from "./kataFiveStepsStill";

/** Robert C. Martin's Bowling Game Kata, in the commits a student makes, each one run in the page. */
export const bowlingKataFeature: Feature = {
  name: "bowling-kata",
  apps: { "bowling-kata": mountBowlingKata, "kata-five-steps": mountKataFiveSteps },
  stills: { "bowling-kata": bowlingKataStill, "kata-five-steps": kataFiveStepsStill },
};
