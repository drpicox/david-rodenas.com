import { detailsOf } from "./detailsOf";
import { layoutArchitecture } from "./layoutArchitecture";
import { metricsOf } from "./metricsOf";
import type { HistoryRead } from "./readHistory";
import { renderArchitectureCaption } from "./renderArchitectureCaption";
import { renderArchitectureSvg } from "./renderArchitectureSvg";
import { renderMetricsSparks } from "./renderMetricsSparks";

/**
 * The source at one commit of its history, drawn, with the network it makes
 * beside it — where a click will put the details of a file or a box — the
 * commit and what it measured under it, and how that went over the whole
 * history. The page's script takes it over as it is laid out, so nothing moves
 * when it does.
 */
export function renderArchitectureFigure(read: HistoryRead, at: number): string {
  const [snapshot, commit] = [read.snapshots[at], read.history.commits[at]];
  if (!snapshot || !commit) return "";
  return (
    `<figure class="architecture-figure"><div class="architecture-stage"><div class="architecture-view">${renderArchitectureSvg(layoutArchitecture(snapshot))}</div>` +
    `<aside class="architecture-details" aria-label="Details">${detailsOf(read, at, null, null)}</aside></div>` +
    `<figcaption>${renderArchitectureCaption(commit, metricsOf(snapshot))}</figcaption>` +
    `${renderMetricsSparks(read.snapshots.map(metricsOf), at)}</figure>`
  );
}
