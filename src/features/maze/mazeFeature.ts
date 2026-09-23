import type { Feature } from "../../platform/plugin/Feature";
import { mountMaze } from "./browser/mountMaze";
import { mazeStill } from "./mazeStill";

/** The maze generator of the VRML course, 2001: a depth-first dig, and spheres that jump across it. */
export const mazeFeature: Feature = {
  name: "maze",
  apps: { maze: mountMaze },
  stills: { maze: mazeStill },
};
