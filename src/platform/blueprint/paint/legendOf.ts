import { type Markup, tag } from "../tag";
import { PLOT } from "./PLOT";

/** At most this many names in a legend: more and it says how many more. */
const MOST = 8;
const ROW = 16;
/** About how wide a letter of a legend is drawn, to know when a row is full. */
const LETTER = 6.2;

/**
 * The names of a picture's series, each beside a swatch of its colour, in
 * rows under the picture, as many as they need: a legend over the lines would
 * cover them, and one that ran on would run out of the picture. None for a
 * single series. Says how tall it is, for the picture to make room.
 */
export function legendOf(names: readonly string[]): { markup: Markup; height: number } {
  if (names.length < 2) return { markup: tag("g", { class: "legend" }), height: 0 };
  const [left, right] = [PLOT.pad.left, PLOT.width - PLOT.pad.right];
  let [across, row] = [left, 0];
  const place = (width: number) => {
    if (across + width > right && across > left) [across, row] = [left, row + 1];
    const at = { x: across, y: PLOT.height + 4 + row * ROW };
    across += width + 14;
    return at;
  };
  const entries = names.slice(0, MOST).map((name, index) => {
    const shown = name.length > 24 ? `${name.slice(0, 23)}…` : name;
    const at = place(14 + shown.length * LETTER);
    return tag("g", { class: `entry bp-s${index % MOST}` }, tag("rect", { x: at.x, y: at.y, width: 10, height: 10, rx: 2 }), tag("text", { x: at.x + 14, y: at.y + 9 }, shown));
  });
  const more = names.length > MOST ? [`+${names.length - MOST} more`].map((said) => tag("text", { class: "more", ...((at) => ({ x: at.x, y: at.y + 9 }))(place(said.length * LETTER)) }, said)) : [];
  return { markup: tag("g", { class: "legend" }, entries, more), height: (row + 1) * ROW + 6 };
}
