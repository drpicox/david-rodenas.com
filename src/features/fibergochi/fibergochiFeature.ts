import type { Feature } from "../../platform/plugin/Feature";
import { mountFibergochi } from "./browser/mountFibergochi";
import { fibergochiStill } from "./fibergochiStill";

/** The Fibergochi of February 1999: a student of the FIB, kept like a Tamagotchi. */
export const fibergochiFeature: Feature = {
  name: "fibergochi",
  apps: { fibergochi: mountFibergochi },
  stills: { fibergochi: fibergochiStill },
};
