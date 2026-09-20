import { renderSourceLine, type SourceIndex } from "../data/renderSourceLine";

/**
 * The line that says whose data a figure is made of. The build wrote it under
 * the still; when the page arrived without a reload there is no still, and
 * the line is made here from the same index, by the same words.
 */
export function sourceLineOf(host: HTMLElement, indexPath: string): HTMLElement {
  const written = host.querySelector<HTMLElement>("p.source");
  if (written) return written;

  const holder = document.createElement("div");
  fetch(indexPath)
    .then((response) => response.json() as Promise<SourceIndex>)
    .then((index) => {
      holder.innerHTML = renderSourceLine(index);
    })
    .catch(() => {});
  return holder;
}
