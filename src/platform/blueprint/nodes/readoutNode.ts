import type { NodeKind } from "../NodeKind";
import { numberSaid } from "../numberSaid";
import { readoutMarkup } from "../paint/readoutMarkup";

/** One number on the board, large: a correlation, a trend, a count. */
export const readoutNode: NodeKind = {
  name: "readout",
  title: "Number",
  role: "paint",
  shelf: "Paint",
  summary: "One number on the board, large: a correlation, a trend, a count.",
  inputs: [
    { name: "value", label: "value", type: "number" },
    { name: "unit", label: "unit", type: "text", optional: true, editor: { kind: "text" } },
    { name: "about", label: "what it is", type: "text", optional: true, editor: { kind: "text" } },
  ],
  outputs: [],
  run: (inputs) => {
    const value = Number(inputs["value"]);
    const unit = inputs["unit"] ? String(inputs["unit"]) : undefined;
    const about = inputs["about"] ? String(inputs["about"]) : undefined;
    // The number is the picture: said again under it, it would say it twice.
    return { painting: { html: readoutMarkup(value, unit, about).html }, said: `${numberSaid(value)}${unit ? ` ${unit}` : ""}` };
  },
};
