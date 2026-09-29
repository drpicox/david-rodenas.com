import { el } from "../../../platform/browser/el";
import type { Coverage } from "../Coverage";
import { type Chosen, detailsOf } from "../detailsOf";
import type { HistoryRead } from "../readHistory";

/** How long the panel waits for the commit to stop moving: a slider dragged asks for many, and only the last is read. */
const SETTLE = 60;

export interface DetailsPanel {
  readonly element: HTMLElement;
  /** What is chosen, at a commit: said at once, or once the commit has stopped moving. */
  tell(at: number, chosen: Chosen, now?: boolean): void;
  stop(): void;
}

/**
 * The panel beside the picture. It says what is chosen on it at the commit
 * shown, and draws itself again only when that has changed, keeping open the
 * list of commits the reader opened while the history moves on under it. Every
 * name in it is a way to its own details: pressed, it is handed to `choose`.
 */
export function detailsPanel(read: HistoryRead, coverage: Coverage | null, choose: (chosen: Chosen) => void): DetailsPanel {
  const element = el("aside", { class: "architecture-details", "aria-label": "Details" });
  let said = "";
  let settling = 0;
  element.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    if (!button) return;
    const { file, box } = button.dataset;
    if (button.hasAttribute("data-back")) choose(null);
    else if (file) choose({ file });
    else if (box) choose({ box });
  });
  const draw = (at: number, chosen: Chosen) => {
    const key = `${at}|${JSON.stringify(chosen)}`;
    if (key === said) return;
    const open = element.querySelector("details")?.open ?? false;
    element.innerHTML = detailsOf(read, at, chosen, coverage);
    const list = element.querySelector("details");
    if (list && open && said.endsWith(`|${JSON.stringify(chosen)}`)) list.open = true;
    said = key;
  };
  return {
    element,
    tell(at, chosen, now = false) {
      window.clearTimeout(settling);
      if (now) draw(at, chosen);
      else settling = window.setTimeout(() => draw(at, chosen), SETTLE);
    },
    stop: () => window.clearTimeout(settling),
  };
}
