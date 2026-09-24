import type { Feature } from "../../platform/plugin/Feature";
import { mountLetters } from "./browser/mountLetters";
import { lettersStill } from "./lettersStill";

/** The first network: letters told apart by backpropagation, the visitor's own among them. */
export const firstNetworkFeature: Feature = {
  name: "first-network",
  apps: { letters: mountLetters },
  stills: { letters: lettersStill },
};
