import "../styles.css";
import { mountApps } from "./apps/mountApps";
import { savedHeaderWorld } from "./headerWorld";
import { mountNavigation } from "./navigation";
import { siteInBrowser } from "./siteInBrowser";
import { spinPlanet } from "./spinPlanet";
import { mountTerminal, type Terminal } from "./terminal";

/**
 * Everything here is an improvement on a page that already works. The words
 * arrived in the HTML; this makes the mark turn, wires the prompt to the
 * shell, and starts the programs the page has left room for.
 */
function mount(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas.planet");
  if (canvas) spinPlanet(canvas, savedHeaderWorld() ?? undefined);

  const route = window.location.pathname.endsWith("/") ? window.location.pathname : `${window.location.pathname}/`;

  // A page change swaps <main>: the programs on the old one stop, the ones on the new one start.
  let stopApps = mountApps();
  let terminal: Terminal | null = null;
  const goTo = mountNavigation(siteInBrowser, (arrived) => {
    stopApps();
    stopApps = mountApps();
    terminal?.moveTo(arrived);
  });

  terminal = mountTerminal(siteInBrowser, siteInBrowser.at(route) ? route : "/", { navigate: goTo });

  const toggle = document.querySelector<HTMLButtonElement>(".theme-toggle");
  if (toggle && terminal) {
    toggle.classList.add("ready");
    toggle.removeAttribute("aria-hidden");
    toggle.removeAttribute("tabindex");
    toggle.addEventListener("click", () => terminal?.run("theme"));
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
