import type { App } from "../../../platform/plugin/Feature";
import { changeFigures } from "../changeFigures";
import type { HistoryRead } from "../readHistory";
import { mountChangeFigure } from "./mountChangeFigure";
import { mountChangePlayer } from "./mountChangePlayer";
import { pointAtChangeMatrix } from "./pointAtChangeMatrix";

/** What a figure answers to besides the commit shown: the picture of changes is also the page's line of time. */
const ENHANCED: Readonly<Record<string, (host: HTMLElement, read: HistoryRead) => () => void>> = { "change-matrix": pointAtChangeMatrix };

/** The programs of the page on how the source changes, by the names its markdown gives them: the player, and every figure, drawn at the commit it shows. */
export const changeApps: Readonly<Record<string, App>> = {
  "change-player": mountChangePlayer,
  ...Object.fromEntries(Object.entries(changeFigures).map(([name, figure]) => [name, mountChangeFigure(figure, ENHANCED[name])])),
};
