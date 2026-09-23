import type { Feature } from "../../platform/plugin/Feature";
import { mountFishMarket } from "./browser/mountFishMarket";
import { fishMarketStill } from "./fishMarketStill";

/** The fish auction of December 2000: the agents that won it, run again, with a seat for the visitor's own. */
export const fishMarketFeature: Feature = {
  name: "fish-market",
  apps: { "fish-market": mountFishMarket },
  stills: { "fish-market": fishMarketStill },
};
