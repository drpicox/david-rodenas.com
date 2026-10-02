import { renderSourceLine, type SourceIndex } from "../data/renderSourceLine";
import { runningAt } from "./runningAt";

/**
 * The line that says whose data a figure is made of. The build wrote it under
 * the still; when the page arrived without a reload there is no still, and
 * the line is made here from the same index, and the year still running when
 * there is one, by the same words.
 */
export function sourceLineOf(host: HTMLElement, indexPath: string, runningPath?: string): HTMLElement {
  const written = host.querySelector<HTMLElement>("p.source");
  if (written) return written;

  const holder = document.createElement("div");
  Promise.all([fetch(indexPath).then((response) => response.json() as Promise<SourceIndex>), runningPath ? runningAt(runningPath) : null])
    .then(([index, running]) => {
      holder.innerHTML = renderSourceLine(index, running);
    })
    .catch(() => {});
  return holder;
}
