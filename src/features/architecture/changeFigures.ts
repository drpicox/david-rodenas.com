import { againstStabilityOf } from "./againstStabilityOf";
import { boxLinksOf } from "./boxLinksOf";
import { cascadeFrom } from "./cascadeFrom";
import { cascadeOf } from "./cascadeOf";
import { couplingsOf } from "./couplingsOf";
import type { Coverage } from "./Coverage";
import { groundOf } from "./groundOf";
import { historyUpTo } from "./historyUpTo";
import { measuresOf } from "./measuresOf";
import { propagationCostOf } from "./propagationCostOf";
import { ratchetHeldOf } from "./ratchetHeldOf";
import type { HistoryRead } from "./readHistory";
import { renderBridgesFigure } from "./renderBridgesFigure";
import { renderCascadeFigure } from "./renderCascadeFigure";
import { renderChangeMatrixFigure } from "./renderChangeMatrixFigure";
import { renderCouplingFigure } from "./renderCouplingFigure";
import { renderCouplingsFigure } from "./renderCouplingsFigure";
import { renderGroundFigure } from "./renderGroundFigure";
import { renderGroupsFigure } from "./renderGroupsFigure";
import { renderHotspotsFigure } from "./renderHotspotsFigure";
import { renderNetworkFigure } from "./renderNetworkFigure";
import { renderRatchetFigure } from "./renderRatchetFigure";
import { renderReachFigure } from "./renderReachFigure";
import { renderRipplesFigure } from "./renderRipplesFigure";
import { renderSettlingFigure } from "./renderSettlingFigure";
import { renderStabilityFigure } from "./renderStabilityFigure";
import { renderTestedChangesFigure } from "./renderTestedChangesFigure";
import { ripplesOf } from "./ripplesOf";
import { shapesOf } from "./shapesOf";
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
    const boxes = stabilityOf(source, lives, sweepsOf(history));
    return renderStabilityFigure(boxes, againstStabilityOf(boxLinksOf(source), boxes));
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
  "change-ground": (read, commit) => {
    const standings = measuresOf.standings(read);
    return renderGroundFigure(groundOf(standings, cascadeFrom(standings, commit), commit), at(read, commit).lives);
  },
  "change-coupling": (read, commit) => renderCouplingFigure(at(read, commit).source),
  "tangle-network": (read, commit) => renderNetworkFigure(at(read, commit).source),
  "tangle-groups": (read, commit) => {
    const { source } = at(read, commit);
    return renderGroupsFigure(source, measuresOf.groups(source));
  },
  "tangle-bridges": (read, commit) => {
    const { source } = at(read, commit);
    return renderBridgesFigure(source, measuresOf.bridges(source));
  },
  "tangle-reach": (read, commit) => renderReachFigure(read.snapshots, commit),
  ratchet: (read, commit) =>
    renderRatchetFigure(
      shapesOf(read),
      commit,
      ratchetHeldOf(read.history),
      read.history.commits.map((one) => one.date),
    ),
};
