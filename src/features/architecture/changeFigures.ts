import { cascadeOf } from "./cascadeOf";
import { couplingsOf } from "./couplingsOf";
import type { Coverage } from "./Coverage";
import { historyUpTo } from "./historyUpTo";
import { propagationCostOf } from "./propagationCostOf";
import type { HistoryRead } from "./readHistory";
import { renderCascadeFigure } from "./renderCascadeFigure";
import { renderChangeMatrixFigure } from "./renderChangeMatrixFigure";
import { renderCouplingsFigure } from "./renderCouplingsFigure";
import { renderHotspotsFigure } from "./renderHotspotsFigure";
import { renderRipplesFigure } from "./renderRipplesFigure";
import { renderSettlingFigure } from "./renderSettlingFigure";
import { renderStabilityFigure } from "./renderStabilityFigure";
import { renderTestedChangesFigure } from "./renderTestedChangesFigure";
import { ripplesOf } from "./ripplesOf";
import type { Snapshot } from "./Snapshot";
import { stabilityOf } from "./stabilityOf";
import { sweepsOf } from "./sweepsOf";
import { testedChangesOf } from "./testedChangesOf";

/** One figure of the page, drawn from the whole history as it stood at one of its commits, with the lines the tests run if they were counted. */
export type ChangeFigure = (read: HistoryRead, at: number, coverage: Coverage | null) => string;

const NOTHING: Snapshot = { modules: [], dependencies: [] };

/** The history at a commit, and the source as it stood there. */
const at = (read: HistoryRead, commit: number) => {
  const then = historyUpTo(read, commit);
  return { ...then, source: then.snapshots.at(-1) ?? NOTHING };
};

/**
 * The figures of the page on how the source changes, by the names its
 * markdown gives them. The build draws each at the last commit for the HTML;
 * the page draws them again at whatever commit the reader is looking at, from
 * the same history, with the same code.
 */
export const changeFigures: Readonly<Record<string, ChangeFigure>> = {
  "change-matrix": (read, commit) => renderChangeMatrixFigure(read, commit),
  "change-settling": (read, commit) => {
    const { history, lives } = at(read, commit);
    return renderSettlingFigure(lives, history.commits.length);
  },
  "change-hotspots": (read, commit, coverage) => {
    const { history, lives } = at(read, commit);
    // The lines the tests run were counted at one commit: at any other they would be about other files.
    const counted = coverage?.sha === history.commits.at(-1)?.sha ? coverage : null;
    return renderHotspotsFigure(lives, history.commits.length, counted, 12, read.history.commits.length);
  },
  "change-stability": (read, commit) => {
    const { history, source, lives } = at(read, commit);
    return renderStabilityFigure(stabilityOf(source, lives, sweepsOf(history)));
  },
  "change-cascade": (read, commit) => {
    const { history, snapshots, source } = at(read, commit);
    return renderCascadeFigure(cascadeOf(history, snapshots), propagationCostOf(source));
  },
  "change-ripples": (read, commit) => {
    const { history, snapshots } = at(read, commit);
    return renderRipplesFigure(ripplesOf(history, snapshots));
  },
  "change-together": (read, commit) => {
    const { history, lives, source } = at(read, commit);
    return renderCouplingsFigure(couplingsOf(history), lives, source);
  },
  "change-tests": (read, commit) => {
    const { history, snapshots } = at(read, commit);
    return renderTestedChangesFigure(testedChangesOf(history, snapshots));
  },
};
