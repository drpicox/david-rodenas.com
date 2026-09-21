import type { Feature } from "../../platform/plugin/Feature";
import { mountPackages } from "./browser/mountPackages";
import { npmSource } from "./npmSource";
import { packagesStill } from "./packagesStill";

/** The npm packages strangers kept installing, and how much, year by year. */
export const packagesFeature: Feature = {
  name: "packages",
  apps: { packages: mountPackages },
  stills: { packages: packagesStill },
  sources: [npmSource],
};
