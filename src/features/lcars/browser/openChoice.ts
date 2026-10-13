import { el } from "../../../platform/browser/el";

/** One answer: what its pad says, what there is to say of it, and the custom property it is coloured in. */
export interface Choice {
  readonly label: string;
  readonly said?: string;
  readonly colour?: string;
}

/**
 * A question the display asks where a hand left it one, as a starship's
 * does: what is asked, and a pad for each answer. The pad pressed is the
 * answer, given once the question is put away; Escape, or a press anywhere
 * else, puts it away with none. Arrows move from pad to pad. Returns how to
 * put it away.
 */
export function openChoice(host: HTMLElement, where: { readonly left: number; readonly top: number }, asked: string, choices: readonly Choice[], chose: (at: number) => void, closed: () => void): () => void {
  const pads = choices.map((choice) => el("button", { type: "button", ...(choice.colour && { style: `--pin: var(${choice.colour})` }) }, el("strong", {}, choice.label), ...(choice.said ? [el("span", {}, choice.said)] : [])));
  const menu = el("div", { class: "lc-choice", role: "dialog", "aria-label": asked, style: `left: ${Math.round(where.left)}px; top: ${Math.round(where.top)}px` }, el("p", {}, asked), el("ul", {}, ...pads.map((pad) => el("li", {}, pad))));
  let open = true;
  const close = () => {
    if (!open) return;
    open = false;
    menu.remove();
    host.ownerDocument.removeEventListener("pointerdown", outside, true);
    closed();
  };
  const outside = (event: Event) => {
    if (!menu.contains(event.target as Node)) close();
  };
  pads.forEach((pad, at) =>
    pad.addEventListener("click", () => {
      close();
      chose(at);
    }),
  );
  menu.addEventListener("keydown", (event) => {
    // Whatever is under the question has keys of its own: Escape here only puts the question away.
    event.stopPropagation();
    const at = pads.indexOf(host.ownerDocument.activeElement as HTMLButtonElement);
    if (event.key === "Escape") close();
    else if (event.key === "ArrowDown") pads[Math.min(pads.length - 1, at + 1)]?.focus();
    else if (event.key === "ArrowUp") pads[Math.max(0, at - 1)]?.focus();
    else return;
    event.preventDefault();
  });
  host.append(menu);
  pads[0]?.focus();
  host.ownerDocument.addEventListener("pointerdown", outside, true);
  return close;
}
