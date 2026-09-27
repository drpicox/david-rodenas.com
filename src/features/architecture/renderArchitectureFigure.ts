import { decodeHistory } from "./decodeHistory";
import type { History } from "./History";
import { layoutArchitecture } from "./layoutArchitecture";
import { metricsOf } from "./metricsOf";
import { renderArchitectureCaption } from "./renderArchitectureCaption";
import { renderArchitectureSvg } from "./renderArchitectureSvg";
import { renderMetricsSparks } from "./renderMetricsSparks";

/** The source at one commit of its history, drawn, with the commit and what it measured under it, and how that went over the whole history. */
export function renderArchitectureFigure(history: History, at: number): string {
  const snapshots = decodeHistory(history);
  const [snapshot, commit] = [snapshots[at], history.commits[at]];
  if (!snapshot || !commit) return "";
  return (
    `<figure class="architecture-figure">${renderArchitectureSvg(layoutArchitecture(snapshot))}` +
    `<figcaption>${renderArchitectureCaption(commit, metricsOf(snapshot))}</figcaption>` +
    `${renderMetricsSparks(snapshots.map(metricsOf), at)}</figure>`
  );
}
