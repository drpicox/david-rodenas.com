import type { Still } from "../../platform/plugin/Feature";
import type { History } from "./History";
import { renderArchitectureFigure } from "./renderArchitectureFigure";

/** The source as it stands at the last commit that changed it, in the HTML before any script. */
export const architectureStill: Still = (read) => {
  const history = JSON.parse(read("/data/architecture.json")) as History;
  return renderArchitectureFigure(history, history.commits.length - 1);
};
