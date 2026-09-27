import type { Feature } from "../../platform/plugin/Feature";
import { bowlingKataStill } from "./bowlingKataStill";
import { mountBowlingKata } from "./browser/mountBowlingKata";

/** Robert C. Martin's Bowling Game Kata, in the commits a student makes, each one run in the page. */
export const bowlingKataFeature: Feature = {
  name: "bowling-kata",
  apps: { "bowling-kata": mountBowlingKata },
  stills: { "bowling-kata": bowlingKataStill },
};
