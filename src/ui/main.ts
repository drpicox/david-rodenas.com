import "../styles.css";
import { ACCENTS, applyAccent, rememberAccent, savedAccent, type Accent } from "./accents";
import { spinPlanet } from "./spinPlanet";

/**
 * Everything here is an improvement on a page that already works. The words
 * arrived in the HTML; this only makes the mark turn and lets a reader choose
 * the one colour on the page.
 */

function mountPlanet(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas.planet");
  if (canvas) spinPlanet(canvas);
}

function mountAccents(): void {
  const footer = document.querySelector(".site-footer");
  if (!footer) return;

  const row = document.createElement("p");
  row.className = "accents";
  row.append("colour");

  const buttons = ACCENTS.map((accent) => {
    const button = document.createElement("button");
    button.type = "button";
    button.style.setProperty("--swatch", accent.light);
    button.setAttribute("aria-label", accent.name);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => choose(accent));
    row.append(button);
    return [accent, button] as const;
  });

  function choose(accent: Accent): void {
    applyAccent(accent);
    rememberAccent(accent);
    for (const [candidate, button] of buttons) {
      button.setAttribute("aria-pressed", candidate === accent ? "true" : "false");
    }
  }

  footer.after(row);
  choose(savedAccent());
}

const current = savedAccent();
applyAccent(current);
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => applyAccent(savedAccent()));

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    mountPlanet();
    mountAccents();
  });
} else {
  mountPlanet();
  mountAccents();
}
