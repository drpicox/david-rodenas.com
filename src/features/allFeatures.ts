import type { Feature } from "../platform/plugin/Feature";
import { architectureFeature } from "./architecture/architectureFeature";
import { adventureFeature } from "./adventure/adventureFeature";
import { airQualityFeature } from "./air-quality/airQualityFeature";
import { developerMeetingsFeature } from "./developer-meetings/developerMeetingsFeature";
import { fibergochiFeature } from "./fibergochi/fibergochiFeature";
import { firstNetworkFeature } from "./first-network/firstNetworkFeature";
import { fishMarketFeature } from "./fish-market/fishMarketFeature";
import { headlineFeature } from "./headline/headlineFeature";
import { lagoonFeature } from "./lagoon/lagoonFeature";
import { mazeFeature } from "./maze/mazeFeature";
import { nextWordFeature } from "./next-word/nextWordFeature";
import { packagesFeature } from "./packages/packagesFeature";
import { portfolioFeature } from "./portfolio/portfolioFeature";
import { postTestsFeature } from "./post-tests/postTestsFeature";
import { recipesFeature } from "./recipes/recipesFeature";
import { seaFeature } from "./sea/seaFeature";
import { rocketFeature } from "./rocket/rocketFeature";
import { stepNamesFeature } from "./step-names/stepNamesFeature";
import { bowlingKataFeature } from "./bowling-kata/bowlingKataFeature";
import { testsAsExamplesFeature } from "./tests-as-examples/testsAsExamplesFeature";
import { gherkinGenieFeature } from "./gherkin-genie/gherkinGenieFeature";
import { smallStepsFeature } from "./small-steps/smallStepsFeature";
import { guessTheRuleFeature } from "./guess-the-rule/guessTheRuleFeature";
import { skyFeature } from "./sky/skyFeature";
import { technicalDebtFeature } from "./technical-debt/technicalDebtFeature";
import { themeFeature } from "./theme/themeFeature";
import { thesisResultsFeature } from "./thesis-results/thesisResultsFeature";
import { weatherFeature } from "./weather/weatherFeature";
import { turning } from "./world/turning";
import { worldFeature } from "./world/worldFeature";
import { writingsFeature } from "./writings/writingsFeature";

/**
 * Everything standing in the frame, and the order it is installed in.
 *
 * Removing a feature is removing its folder and its line here. Nothing else in
 * the site names any of them, and no feature names another: where two go
 * together — the stars following whatever world turns — it is said here.
 */
export const allFeatures: readonly Feature[] = [
  worldFeature,
  themeFeature,
  skyFeature(turning),
  technicalDebtFeature,
  developerMeetingsFeature,
  headlineFeature,
  airQualityFeature,
  weatherFeature,
  seaFeature,
  nextWordFeature,
  rocketFeature,
  packagesFeature,
  thesisResultsFeature,
  adventureFeature,
  postTestsFeature,
  fishMarketFeature,
  lagoonFeature,
  mazeFeature,
  firstNetworkFeature,
  fibergochiFeature,
  portfolioFeature,
  architectureFeature,
  stepNamesFeature,
  bowlingKataFeature,
  testsAsExamplesFeature,
  gherkinGenieFeature,
  smallStepsFeature,
  guessTheRuleFeature,
  writingsFeature,
  recipesFeature,
];
