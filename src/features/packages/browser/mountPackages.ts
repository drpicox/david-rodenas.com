import { sourceLineOf } from "../../../platform/browser/sourceLineOf";
import type { NpmDownloads } from "../NpmDownloads";
import { renderPackages } from "../renderPackages";

/**
 * The build wrote the whole figure, so on a page that arrived with its HTML
 * there is nothing to do. On one that arrived without a reload there is no
 * still, and the same function draws it from the same file.
 */
export function mountPackages(host: HTMLElement): void {
  if (host.querySelector("figure")) return;
  const source = sourceLineOf(host, "/data/npm/index.json");
  fetch("/data/npm/downloads.json")
    .then((response) => response.json() as Promise<NpmDownloads>)
    .then((downloads) => {
      host.innerHTML = renderPackages(downloads);
      host.append(source);
    })
    .catch(() => {
      host.textContent = "The download counts did not arrive. The rest of the page does not depend on them.";
    });
}
