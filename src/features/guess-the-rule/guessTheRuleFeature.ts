import type { Feature } from "../../platform/plugin/Feature";
import { mountGuessTheRule } from "./browser/mountGuessTheRule";
import { guessTheRuleStill } from "./guessTheRuleStill";

/** Guess the rule, from my old site of 2020: sequences marked by a hidden rule, and the rule to find. */
export const guessTheRuleFeature: Feature = {
  name: "guess-the-rule",
  apps: { "guess-the-rule": (host) => mountGuessTheRule(host) },
  stills: { "guess-the-rule": guessTheRuleStill },
};
