import type { Feature } from "../../platform/plugin/Feature";
import { mountNextWord } from "./browser/mountNextWord";
import { nextWordStill } from "./nextWordStill";

/** A language model with everything taken away but the idea: count which word follows which, and throw the dice. */
export const nextWordFeature: Feature = {
  name: "next-word",
  apps: { "next-word": mountNextWord },
  stills: { "next-word": nextWordStill },
};
