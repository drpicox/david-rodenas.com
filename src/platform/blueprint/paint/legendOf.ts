import { type Markup, tag } from "../tag";
import { PLOT } from "./PLOT";

/** At most this many names in a legend: more and it covers the picture. */
const MOST = 8;

/** The names of a picture's series, each beside a swatch of its colour, along the top of the inside; none for a single series. */
export function legendOf(names: readonly string[]): Markup {
  if (names.length < 2) return tag("g", { class: "legend" });
  let across = PLOT.pad.left + 6;
  const entries = names.slice(0, MOST).map((name, index) => {
    const at = across;
    across += 18 + Math.min(18, name.length) * 6.2;
    return tag("g", { class: `entry bp-s${index % MOST}` }, tag("rect", { x: at, y: PLOT.pad.top + 2, width: 10, height: 10, rx: 2 }), tag("text", { x: at + 14, y: PLOT.pad.top + 11 }, name.length > 18 ? `${name.slice(0, 17)}…` : name));
  });
  const more = names.length > MOST ? tag("text", { class: "more", x: across, y: PLOT.pad.top + 11 }, `+${names.length - MOST}`) : null;
  return tag("g", { class: "legend" }, entries, more);
}
