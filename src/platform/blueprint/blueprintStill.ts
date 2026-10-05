import { evaluateBlueprint } from "./evaluateBlueprint";
import type { Kit } from "./kitOf";
import { parseBlueprint } from "./parseBlueprint";
import { renderBlueprintSvg } from "./renderBlueprintSvg";
import { renderBoard } from "./renderBoard";
import { type Markup, tag } from "./tag";
import { tidyBlueprint } from "./tidyBlueprint";

/**
 * A blueprint written in a page, before any script: run at build time on the
 * same files the browser will fetch, its board — dials and pictures — and
 * the blueprint itself drawn under it, and written out as text for whoever
 * wants to read it, or copy it. The page carries all of it in its HTML.
 */
export function blueprintStill(kit: Kit): (read: (path: string) => string, dials: readonly string[], source?: string) => string {
  return (read, _dials, source = "") => {
    const { blueprint, placed } = parseBlueprint(source, kit);
    const laid = placed ? blueprint : tidyBlueprint(blueprint, kit);
    const evaluation = evaluateBlueprint(laid, kit, { read });
    const drawn: Markup = { html: renderBlueprintSvg(laid, kit, evaluation, read) };
    return tag(
      "div",
      { class: "bp-still" },
      { html: renderBoard(laid, kit, evaluation, read) },
      tag("figure", { class: "bp-drawn" }, drawn, tag("figcaption", {}, `The blueprint: ${laid.nodes.length} nodes and ${laid.wires.length} wires.`)),
      tag("details", { class: "bp-text" }, tag("summary", {}, "The blueprint as text"), tag("pre", {}, tag("code", {}, source.trim()))),
    ).html;
  };
}
