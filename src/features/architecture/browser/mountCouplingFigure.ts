import { el } from "../../../platform/browser/el";
import { boxOf } from "../boxOf";
import type { HistoryRead } from "../readHistory";
import { renderCouplingFigure } from "../renderCouplingFigure";
import { changesInBrowser } from "./changesInBrowser";
import { shownCommit } from "./shownCommit";

/**
 * A box's two couplings, for whichever box the reader picks: the build drew
 * one, and here any box can be drawn instead, at the commit the page shows,
 * and again whenever that moves. The still stays until the history arrives.
 */
export function mountCouplingFigure(host: HTMLElement): () => void {
  let stopped = false;
  let read: HistoryRead | null = null;
  let chosen: string | null = null;
  let listed = "";
  const select = el("select", { "aria-label": "The box whose couplings are drawn" });
  const picture = el("div", { class: "coupling-picture" });

  const draw = () => {
    if (!read || stopped) return;
    const snapshot = read.snapshots[shownCommit.get() ?? read.snapshots.length - 1];
    if (!snapshot) return;
    const boxes = [...new Set(snapshot.modules.filter((module) => !module.test).map((module) => boxOf(module.path)))].sort((a, b) => a.localeCompare(b));
    // The list is made again only when the boxes are not the ones it holds, so that a reader choosing is not interrupted.
    if (boxes.join() !== listed) {
      select.replaceChildren(...boxes.map((box) => el("option", { value: box }, box)));
      listed = boxes.join();
    }
    picture.innerHTML = renderCouplingFigure(snapshot, chosen && boxes.includes(chosen) ? chosen : undefined);
    select.value = picture.querySelector<SVGSVGElement>("svg.coupling")?.dataset["box"] ?? "";
  };

  select.addEventListener("change", () => {
    chosen = select.value;
    draw();
  });
  const stopListening = shownCommit.on(draw);
  changesInBrowser()
    .then((changes) => {
      if (stopped) return;
      read = changes.read;
      host.replaceChildren(el("label", { class: "coupling-choice" }, "the box: ", select), picture);
      draw();
    })
    .catch(() => {
      // Without the history the still stays: one box, drawn at the last commit.
    });
  return () => {
    stopped = true;
    stopListening();
  };
}
