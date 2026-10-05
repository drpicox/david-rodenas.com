import { type Markup, tag } from "../tag";
import { PLOT } from "./PLOT";

/** A picture's outer element: scaled to the width it is given, and said in words for whoever does not see it. */
export function plotSvg(said: string, ...inside: readonly Markup[]): Markup {
  return tag("svg", { class: "bp-plot", viewBox: `0 0 ${PLOT.width} ${PLOT.height}`, role: "img", "aria-label": said }, inside);
}
