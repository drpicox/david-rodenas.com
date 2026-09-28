import type { App } from "../../../platform/plugin/Feature";
import type { ChangeFigure } from "../changeFigures";
import type { HistoryRead } from "../readHistory";
import { changesInBrowser, type ChangesLoaded } from "./changesInBrowser";
import { shownCommit } from "./shownCommit";

/**
 * A figure of the page on how the source changes, drawn by the page itself.
 * The HTML the build wrote holds it at the last commit, but a move made
 * without a reload brings only its place; and the reader may ask for another
 * commit. It is drawn at the commit the page is showing, and again whenever
 * that moves — while it is on screen: one scrolled past is drawn again when
 * it comes back into view. Whatever else it answers to, `enhance` adds.
 */
export function mountChangeFigure(figure: ChangeFigure, enhance?: (host: HTMLElement, read: HistoryRead) => () => void): App {
  return (host) => {
    let loaded: ChangesLoaded | null = null;
    let drawnAt: number | null = null;
    let onScreen = true;
    let stopped = false;
    let stopEnhancing = () => {};

    // Drawn the first time wherever it is, so the page does not grow under a reader scrolling down it; after that, only while it can be seen.
    const draw = (anywhere = false) => {
      if (!loaded || stopped || (!onScreen && !anywhere)) return;
      const at = shownCommit.get() ?? loaded.read.history.commits.length - 1;
      if (at === drawnAt) return;
      host.innerHTML = figure(loaded.read, at, loaded.coverage);
      drawnAt = at;
    };

    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) onScreen = entry.isIntersecting;
              draw();
            },
            { rootMargin: "200px" },
          )
        : null;
    observer?.observe(host);
    const stopListening = shownCommit.on(() => draw());

    changesInBrowser()
      .then((changes) => {
        if (stopped) return;
        loaded = changes;
        // The still the build wrote is this very figure at the last commit: it stays, if it is there.
        if (host.querySelector("figure") && shownCommit.get() === null) drawnAt = changes.read.history.commits.length - 1;
        draw(true);
        if (enhance) stopEnhancing = enhance(host, changes.read);
      })
      .catch(() => {
        // Without the history the still stays, and it is the last commit already; with no still, the words around it still say what it is.
      });

    return () => {
      stopped = true;
      stopListening();
      observer?.disconnect();
      stopEnhancing();
    };
  };
}
