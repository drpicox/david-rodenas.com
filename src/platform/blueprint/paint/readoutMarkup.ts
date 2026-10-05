import { numberSaid } from "../numberSaid";
import { type Markup, tag } from "../tag";

/** One number, large, with its unit, and a line on what it is. */
export function readoutMarkup(value: number, unit: string | undefined, about: string | undefined): Markup {
  return tag("div", { class: "bp-readout" }, tag("span", { class: "value" }, numberSaid(value)), unit ? tag("span", { class: "unit" }, ` ${unit}`) : null, about ? tag("p", { class: "about" }, about) : null);
}
