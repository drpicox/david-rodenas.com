import type { Feature } from "../../platform/plugin/Feature";
import { architectureStill } from "./architectureStill";
import { mountArchitecture } from "./browser/mountArchitecture";
import { changeStills } from "./changeStills";

/**
 * The site's own architecture: its source read as a graph of boxes and the
 * arrows between them, for the tests that guard the shape, and drawn on its
 * page commit by commit. The reading of the source runs in node only; what
 * reaches the browser is the history the tool wrote, and the picture of it.
 */
export const architectureFeature: Feature = {
  name: "architecture",
  apps: { architecture: mountArchitecture },
  stills: { architecture: architectureStill, ...changeStills },
};
