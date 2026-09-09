const HEIGHT_KEY = "shell-height";

/** Not so short that a line is lost, not so tall that the page is. */
function clamp(height: number): number {
  return Math.min(Math.max(height, 40), window.innerHeight * 0.85);
}

/**
 * A hand on the grip drags the top edge of the screen up or down, and the
 * screen keeps that height from then on, on every page, until a double-click
 * gives it back to the page. The height is a variable on the terminal so the
 * stylesheet owns what it means; this only says the number.
 */
export function resizeScreen(grip: HTMLElement, screen: HTMLElement, terminal: HTMLElement): void {
  const set = (height: number | null) => {
    if (height === null) terminal.style.removeProperty("--screen-height");
    else terminal.style.setProperty("--screen-height", `${Math.round(height)}px`);
  };

  const remember = (height: number | null) => {
    try {
      if (height === null) localStorage.removeItem(HEIGHT_KEY);
      else localStorage.setItem(HEIGHT_KEY, String(Math.round(height)));
    } catch {
      // The next page starts at the page's own size, which is no worse than today.
    }
  };

  let height: number | null = null;
  try {
    const kept = Number(localStorage.getItem(HEIGHT_KEY));
    if (kept > 0) height = clamp(kept);
  } catch {
    // Same: nothing kept, nothing lost.
  }
  set(height);

  grip.addEventListener("pointerdown", (down) => {
    down.preventDefault();
    try {
      grip.setPointerCapture(down.pointerId);
    } catch {
      // A pointer that cannot be captured still moves; the drag only ends sooner if it leaves the grip.
    }
    const from = { y: down.clientY, height: screen.getBoundingClientRect().height };
    const move = (event: PointerEvent) => {
      height = clamp(from.height + (from.y - event.clientY));
      set(height);
    };
    const up = () => {
      grip.removeEventListener("pointermove", move);
      grip.removeEventListener("pointerup", up);
      grip.removeEventListener("pointercancel", up);
      remember(height);
    };
    grip.addEventListener("pointermove", move);
    grip.addEventListener("pointerup", up);
    grip.addEventListener("pointercancel", up);
  });

  grip.addEventListener("dblclick", () => {
    height = null;
    set(null);
    remember(null);
  });
}
