import { evaluateBlueprint } from "./evaluateBlueprint";
import { examplesOf } from "./examplesOf";
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
 * wants to read it, or copy it. The page carries all of it in its HTML. A
 * place that holds many shows the first, and writes every one out, each
 * where a link to it finds it.
 */
export function blueprintStill(kit: Kit): (read: (path: string) => string, dials: readonly string[], source?: string) => string {
  return (read, _dials, source = "") => {
    const examples = examplesOf(source);
    const [shown = { title: "", slug: "", about: "", text: "" }] = examples;
    const { blueprint, placed } = parseBlueprint(shown.text, kit);
    const laid = placed ? blueprint : tidyBlueprint(blueprint, kit);
    const evaluation = evaluateBlueprint(laid, kit, { read });
    const drawn: Markup = { html: renderBlueprintSvg(laid, kit, evaluation, read) };
    const texts =
      examples.length > 1
        ? examples.map((example) => tag("details", { class: "bp-text", id: example.slug || undefined }, tag("summary", {}, example.title), example.about ? tag("p", {}, example.about) : "", tag("pre", {}, tag("code", {}, example.text))))
        : [tag("details", { class: "bp-text" }, tag("summary", {}, "The blueprint as text"), tag("pre", {}, tag("code", {}, shown.text)))];
    return tag(
      "div",
      { class: "bp-still" },
      shown.title ? tag("p", { class: "bp-about" }, tag("strong", {}, shown.title), shown.about ? ` ${shown.about}` : "") : "",
      { html: renderBoard(laid, kit, evaluation, read) },
      tag("figure", { class: "bp-drawn" }, drawn, tag("figcaption", {}, `The blueprint: ${laid.nodes.length} nodes and ${laid.wires.length} wires.`)),
      ...texts,
    ).html;
  };
}
