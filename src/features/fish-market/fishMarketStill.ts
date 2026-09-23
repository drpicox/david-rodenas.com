import type { Still } from "../../platform/plugin/Feature";
import { openAuction } from "./openAuction";
import { renderFishMarket } from "./renderFishMarket";
import { theTable } from "./theTable";

/** The moment before the first lot: the five seated, and what each asks, drawn from the same seed the browser starts on. */
export const fishMarketStill: Still = () => renderFishMarket(openAuction(1, theTable(), 0.5));
