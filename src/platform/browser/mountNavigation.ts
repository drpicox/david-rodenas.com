import type { Page } from "../content/Page";
import type { Site } from "../content/Site";
import { APPEARANCE, declaredAppearance } from "../page/declaredAppearance";
import { isHere } from "../page/isHere";
import { renderMain } from "../page/renderMain";

export interface Move {
  /** Whether the address goes into the history; false when the history is what brought us here. */
  readonly push?: boolean;
  /** Keep the paper: the shell moved the session, so only the address and what depends on it change. */
  readonly keep?: boolean;
}

export type GoTo = (route: string, move?: Move) => boolean;

/**
 * Moving between pages without leaving the one that is open. The markdown is
 * already here and so is the renderer, so a link only has to swap what is
 * inside `<main>`; the header, the planet and the shell stay put. When the
 * shell itself moves — a `cd`, a `cat` — the paper is kept: the address, the
 * title, the lit name in the navigation and what the page declares about
 * its looks follow, and nothing printed is lost. Anything not in the site —
 * a PDF, another site — is a real navigation.
 */
export function mountNavigation(site: Site, onArrive: (page: Page, kept: boolean) => void): GoTo {
  const main = document.querySelector("main");
  if (!main) return () => false;

  const goTo: GoTo = (route, { push = true, keep = false } = {}) => {
    const page = site.at(route);
    if (!page) return false;
    if (!keep) main.innerHTML = renderMain(site, page);
    // What the new page declares about how it looks; what that means is the features' business.
    const declared = declaredAppearance(page);
    for (const attribute of APPEARANCE) {
      const value = declared[attribute];
      if (value) document.documentElement.setAttribute(attribute, value);
      else document.documentElement.removeAttribute(attribute);
    }
    document.title = page.route === "/" ? "David Rodenas" : `${page.title} — David Rodenas`;
    for (const link of document.querySelectorAll<HTMLAnchorElement>("nav .navlink")) {
      const here = isHere(route, link.getAttribute("href") ?? "\0");
      if (here) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    if (push) {
      if (route === window.location.pathname) window.history.replaceState({ route }, "", route);
      else window.history.pushState({ route }, "", route);
      if (!keep) window.scrollTo({ top: 0 });
    }
    window.goatcounter?.count?.({ path: route, title: document.title });
    onArrive(page, keep);
    return true;
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
    if (!anchor || anchor.target || anchor.dataset["run"]) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    const route = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    if (!site.at(route)) return;
    event.preventDefault();
    if (route !== window.location.pathname) goTo(route);
  });

  window.addEventListener("popstate", () => {
    const route = window.location.pathname.endsWith("/") ? window.location.pathname : `${window.location.pathname}/`;
    goTo(route, { push: false });
  });

  return goTo;
}
