import { el } from "../../browser/el";

/**
 * A look at what an output gives, beside it on the canvas: what it is
 * called, and markup made where there is no DOM — a table's first rows, what
 * its columns are. The ✕, Escape, or a press anywhere else closes it; Escape
 * closes it before anything else it would do.
 */
export function openPeek(host: HTMLElement, title: string, html: string, anchor: Element): () => void {
  const close = el("button", { type: "button", class: "wb-help-close", "aria-label": "Close" }, "✕");
  const body = el("div", { class: "wb-peek-body" });
  body.innerHTML = html;
  const panel = el("div", { class: "wb-peek-panel", role: "dialog", "aria-label": title }, close, el("p", { class: "wb-peek-title" }, title), body);
  const box = host.getBoundingClientRect();
  const at = anchor.getBoundingClientRect();
  panel.style.left = `${Math.round(Math.max(4, Math.min(at.right - box.left + 10, box.width - 400)))}px`;
  panel.style.top = `${Math.round(Math.max(4, Math.min(at.top - box.top - 10, box.height - 240)))}px`;
  const page = host.ownerDocument;
  const shut = () => {
    panel.remove();
    page.removeEventListener("pointerdown", outside, true);
    page.removeEventListener("keydown", escape, true);
  };
  const outside = (event: Event) => {
    if (!panel.contains(event.target as Node)) shut();
  };
  const escape = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    shut();
  };
  close.addEventListener("click", shut);
  // The wheel scrolls the rows, never the canvas under them.
  panel.addEventListener("wheel", (event) => event.stopPropagation());
  host.append(panel);
  page.addEventListener("pointerdown", outside, true);
  page.addEventListener("keydown", escape, true);
  return shut;
}
