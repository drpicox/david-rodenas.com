import { dayOf } from "../dayOf";
import { describeMatrixCell } from "../describeMatrixCell";
import { matrixCellsOf } from "../matrixCellsOf";
import type { HistoryRead } from "../readHistory";
import { shownCommit } from "./shownCommit";

const SVG = "http://www.w3.org/2000/svg";

/**
 * The picture of changes as the page's line of time: pointing at a cell says,
 * under the picture, which box, which commit, and the files it changed or
 * wrote there; pressing one takes every figure of the page to that commit.
 * It listens on the host, so it holds while the picture is drawn again.
 */
export function pointAtChangeMatrix(host: HTMLElement, read: HistoryRead): () => void {
  const cells = matrixCellsOf(read.lives);
  const commits = read.history.commits;

  // The picture is a drawing scaled to fit: a point on it is read in the drawing's own units, against where it says its commits and rows are.
  const cellUnder = (event: PointerEvent) => {
    const svg = host.querySelector<SVGSVGElement>("svg.change-matrix");
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const [left, step, height] = [Number(svg.dataset["left"]), Number(svg.dataset["step"]), Number(svg.dataset["row"])];
    const at = Math.floor((point.x - left) / step);
    if (!(at >= 0 && at < commits.length)) return null;
    const row = [...svg.querySelectorAll<SVGTextElement>("text.row")].find((label) => point.y >= Number(label.dataset["top"]) && point.y < Number(label.dataset["top"]) + height);
    return { svg, at, x: left + at * step, row: row ? { box: row.dataset["box"] || null } : null };
  };

  const say = (words: string) => {
    const line = host.querySelector(".changes-pointed");
    if (line) line.textContent = words;
  };
  const mark = (svg: SVGSVGElement | null, x: number, width: number) => {
    host.querySelector("rect.pointed")?.remove();
    if (!svg) return;
    const rect = document.createElementNS(SVG, "rect");
    rect.setAttribute("class", "pointed");
    rect.setAttribute("x", String(x));
    rect.setAttribute("y", "0");
    rect.setAttribute("width", String(width));
    rect.setAttribute("height", String(svg.viewBox.baseVal.height - 20));
    svg.prepend(rect);
  };

  const onMove = (event: PointerEvent) => {
    const cell = cellUnder(event);
    const commit = cell && commits[cell.at];
    if (!cell || !commit) {
      mark(null, 0, 0);
      return say("");
    }
    mark(cell.svg, cell.x, Number(cell.svg.dataset["step"]));
    say(cell.row ? describeMatrixCell(cell.row.box, commit, cells.get(cell.row.box, cell.at)) : `${dayOf(commit)} — ${commit.subject}`);
  };
  const onLeave = () => {
    mark(null, 0, 0);
    say("");
  };
  const onPress = (event: PointerEvent) => {
    const cell = cellUnder(event);
    if (cell) shownCommit.set(cell.at >= commits.length - 1 ? null : cell.at);
  };

  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerleave", onLeave);
  host.addEventListener("pointerdown", onPress);
  return () => {
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerleave", onLeave);
    host.removeEventListener("pointerdown", onPress);
  };
}
