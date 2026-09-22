import type { Feature } from "../platform/plugin/Feature";
import { adventureFeature } from "./adventure/adventureFeature";
import { airQualityFeature } from "./air-quality/airQualityFeature";
import { developerMeetingsFeature } from "./developer-meetings/developerMeetingsFeature";
import { headlineFeature } from "./headline/headlineFeature";
import { nextWordFeature } from "./next-word/nextWordFeature";
import { packagesFeature } from "./packages/packagesFeature";
import { rocketFeature } from "./rocket/rocketFeature";
import { skyFeature } from "./sky/skyFeature";
import { technicalDebtFeature } from "./technical-debt/technicalDebtFeature";
import { themeFeature } from "./theme/themeFeature";
import { thesisResultsFeature } from "./thesis-results/thesisResultsFeature";
import { weatherFeature } from "./weather/weatherFeature";
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
  headlineFeature,
  airQualityFeature,
  weatherFeature,
  nextWordFeature,
  rocketFeature,
  packagesFeature,
  thesisResultsFeature,
  adventureFeature,
];
