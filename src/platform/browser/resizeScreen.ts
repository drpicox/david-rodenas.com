/** Not so tall that the page is lost. */
function clamp(height: number): number {
  return Math.min(Math.max(height, 0), window.innerHeight * 0.85);
}

/** Dragged down to less than a line, the screen is not kept that small; it is given back. */
const A_LINE = 24;

/**
 * A hand on the grip drags the top edge of the screen up or down, and the
 * screen keeps that height until a double-click, a drag down to nothing, or
 * whoever holds the hand this returns gives it back — which `clear` does, and
 * a new page does. Nothing is remembered: left alone, the screen grows with
 * what is printed and shrinks with `clear`, and that is the shape it should
 * have. The height is a variable on the terminal so the stylesheet owns what
 * it means; this only says the number.
 */
export function resizeScreen(grip: HTMLElement, screen: HTMLElement, terminal: HTMLElement): () => void {
  const set = (height: number | null) => {
    if (height === null) terminal.style.removeProperty("--screen-height");
    else terminal.style.setProperty("--screen-height", `${Math.round(height)}px`);
  };

  grip.addEventListener("pointerdown", (down) => {
    down.preventDefault();
    try {
      grip.setPointerCapture(down.pointerId);
    } catch {
      // A pointer that cannot be captured still moves; the drag only ends sooner if it leaves the grip.
    }
    const from = { y: down.clientY, height: screen.getBoundingClientRect().height };
    const move = (event: PointerEvent) => {
      const dragged = clamp(from.height + (from.y - event.clientY));
      set(dragged < A_LINE ? null : dragged);
    };
    const up = () => {
      grip.removeEventListener("pointermove", move);
      grip.removeEventListener("pointerup", up);
      grip.removeEventListener("pointercancel", up);
    };
    grip.addEventListener("pointermove", move);
    grip.addEventListener("pointerup", up);
    grip.addEventListener("pointercancel", up);
  });

  grip.addEventListener("dblclick", () => set(null));

  return () => set(null);
}
