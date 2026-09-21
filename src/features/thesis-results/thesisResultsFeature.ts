import type { Feature } from "../../platform/plugin/Feature";
import { graphMatchingRuns } from "./graphMatchingRuns";
import { renderRuns } from "./renderRuns";

/**
 * The measurements of the thesis, drawn. Nothing to choose and nothing to
 * fetch: the figure is written into the HTML by the build, and drawn by the
 * same function on a page that arrived without a reload.
 */
export const thesisResultsFeature: Feature = {
  name: "thesis-results",
  stills: { "graph-matching-runs": () => renderRuns(graphMatchingRuns) },
  apps: {
    "graph-matching-runs": (host) => {
      if (!host.firstChild) host.innerHTML = renderRuns(graphMatchingRuns);
    },
  },
};
