import type { App } from "../../../platform/plugin/Feature";
import { changeFigures } from "../changeFigures";
import type { HistoryRead } from "../readHistory";
import { mountArchitecture } from "./mountArchitecture";
import { mountChangeFigure } from "./mountChangeFigure";
import { mountChangePlayer } from "./mountChangePlayer";
import { mountCouplingFigure } from "./mountCouplingFigure";
import { pointAtChangeMatrix } from "./pointAtChangeMatrix";
import { shownCommit } from "./shownCommit";

/** What a figure answers to besides the commit shown: the picture of changes is also the page's line of time. */
const ENHANCED: Readonly<Record<string, (host: HTMLElement, read: HistoryRead) => () => void>> = { "change-matrix": pointAtChangeMatrix };

/** The programs of the page on how the source changes, by the names its markdown gives them: the player, and every figure, drawn at the commit it shows. */
export const changeApps: Readonly<Record<string, App>> = {
  "change-player": mountChangePlayer,
  // The picture of the source again, following the page's player, seen through what changed: warm where it did lately, as big as it did, and threaded to what it changed with.
  "change-graph": mountArchitecture({ follow: shownCommit, lenses: { sizing: "changes", colour: "heat", together: true, pointing: "together" } }),
  ...Object.fromEntries(Object.entries(changeFigures).map(([name, figure]) => [name, mountChangeFigure(figure, ENHANCED[name])])),
  // A box's couplings, for any box the reader picks.
  "change-coupling": mountCouplingFigure,
};
