import type { Feature } from "../../platform/plugin/Feature";
import { architectureStill } from "./architectureStill";
import { changeApps } from "./browser/changeApps";
import { mountArchitecture } from "./browser/mountArchitecture";
import { shownCommit } from "./browser/shownCommit";
import { changeStills } from "./changeStills";
import { architectureNodes } from "./nodes/architectureNodes";
import { graphType } from "./nodes/graphType";

/**
 * The site's own architecture: its source read as a graph of boxes and the
 * arrows between them, for the tests that guard the shape, and drawn on its
 * page commit by commit; and the same history read for what changes, how
 * often and with what, on a page of its own; and the source as a graph a
 * blueprint can take apart. The reading of the source runs in node only;
 * what reaches the browser is the history the tool wrote, and the pictures
 * of it.
 */
export const architectureFeature: Feature = {
  name: "architecture",
  // The picture of how the site is built leads its page: the figures of what the tangle shows follow its player.
  apps: { architecture: mountArchitecture({ lead: shownCommit }), ...changeApps },
  stills: { architecture: architectureStill, ...changeStills },
  nodes: architectureNodes,
  pinTypes: [graphType],
};
