import type { Still } from "../../platform/plugin/Feature";
import { cascadeOf } from "./cascadeOf";
import { couplingsOf } from "./couplingsOf";
import type { Coverage } from "./Coverage";
import { propagationCostOf } from "./propagationCostOf";
import { readHistory } from "./readHistory";
import { renderCascadeFigure } from "./renderCascadeFigure";
import { renderChangeMatrixFigure } from "./renderChangeMatrixFigure";
import { renderCouplingsFigure } from "./renderCouplingsFigure";
import { renderHotspotsFigure } from "./renderHotspotsFigure";
import { renderRipplesFigure } from "./renderRipplesFigure";
import { renderSettlingFigure } from "./renderSettlingFigure";
import { renderStabilityFigure } from "./renderStabilityFigure";
import { renderTestedChangesFigure } from "./renderTestedChangesFigure";
import { ripplesOf } from "./ripplesOf";
import { stabilityOf } from "./stabilityOf";
import { testedChangesOf } from "./testedChangesOf";

/** Where the figures read the history, and the lines the tests run, as the browser would ask for them. */
const HISTORY = "/data/architecture.json";
const COVERAGE = "/data/coverage.json";

const historyIn = (read: (path: string) => string) => {
  const history = readHistory(read(HISTORY));
  return { ...history, last: history.snapshots.at(-1) ?? { modules: [], dependencies: [] } };
};

/** The lines the tests run, if they were counted at the commit the history ends on: counted at another, they would be about other files. */
function coverageIn(read: (path: string) => string, sha: string | undefined): Coverage | null {
  try {
    const coverage = JSON.parse(read(COVERAGE)) as Coverage;
    return coverage.sha === sha ? coverage : null;
  } catch {
    return null;
  }
}

/** The figures of the page on how the source changes, by the names its markdown gives them: each read off the same history, in the HTML before any script. */
export const changeStills: Readonly<Record<string, Still>> = {
  "change-matrix": (read) => renderChangeMatrixFigure(historyIn(read)),
  "change-settling": (read) => {
    const { history, lives } = historyIn(read);
    return renderSettlingFigure(lives, history.commits.length);
  },
  "change-hotspots": (read) => {
    const { history, lives } = historyIn(read);
    return renderHotspotsFigure(lives, history.commits.length, coverageIn(read, history.commits.at(-1)?.sha));
  },
  "change-stability": (read) => {
    const { last, lives } = historyIn(read);
    return renderStabilityFigure(stabilityOf(last, lives));
  },
  "change-cascade": (read) => {
    const { history, snapshots, last } = historyIn(read);
    return renderCascadeFigure(cascadeOf(history, snapshots), propagationCostOf(last));
  },
  "change-ripples": (read) => {
    const { history, snapshots } = historyIn(read);
    return renderRipplesFigure(ripplesOf(history, snapshots));
  },
  "change-together": (read) => {
    const { history, lives, last } = historyIn(read);
    return renderCouplingsFigure(couplingsOf(history), lives, last);
  },
  "change-tests": (read) => {
    const { history, snapshots } = historyIn(read);
    return renderTestedChangesFigure(testedChangesOf(history, snapshots));
  },
};
