import type { Feature } from "../platform/plugin/Feature";
import { developerMeetingsFeature } from "./developer-meetings/developerMeetingsFeature";
import { skyFeature } from "./sky/skyFeature";
import { technicalDebtFeature } from "./technical-debt/technicalDebtFeature";
import { themeFeature } from "./theme/themeFeature";
import { worldFeature } from "./world/worldFeature";

/**
 * Everything standing in the frame, and the order it is installed in.
 *
 * Removing a feature is removing its folder and its line here. Nothing else in
 * the site names any of them.
 */
export const allFeatures: readonly Feature[] = [
  worldFeature,
  themeFeature,
  skyFeature,
  technicalDebtFeature,
  developerMeetingsFeature,
];
