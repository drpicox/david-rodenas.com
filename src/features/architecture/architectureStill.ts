import type { Still } from "../../platform/plugin/Feature";
import { readHistory } from "./readHistory";
import { renderArchitectureFigure } from "./renderArchitectureFigure";

/** The source as it stands at the last commit that changed it, in the HTML before any script. */
export const architectureStill: Still = (read) => {
  const history = readHistory(read("/data/architecture.json"));
  return renderArchitectureFigure(history, history.history.commits.length - 1);
};
