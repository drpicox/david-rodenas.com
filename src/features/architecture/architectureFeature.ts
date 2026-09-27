import type { Feature } from "../../platform/plugin/Feature";

/**
 * The site's own architecture: its source read as a graph of boxes and the
 * arrows between them. The reading runs in node, for the tests that guard the
 * shape and for the tool that draws it; nothing of it reaches the browser.
 */
export const architectureFeature: Feature = {
  name: "architecture",
};
