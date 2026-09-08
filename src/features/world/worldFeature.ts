import type { Feature } from "../../platform/plugin/Feature";
import { mountHeaderWorld } from "./browser/mountHeaderWorld";
import { mountWorlds } from "./browser/mountWorlds";

/**
 * The planet: the 1999 filter pipeline, the rasteriser, the mark in the header,
 * the icon in the tab, and the page where the dials are on the outside. It used
 * to be in six places; it is in this folder.
 */
export const worldFeature: Feature = {
  name: "world",
  apps: { worlds: mountWorlds },
  install: () => mountHeaderWorld(),
};
