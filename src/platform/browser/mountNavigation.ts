import type { Page } from "../content/Page";
import type { Site } from "../content/Site";
import { APPEARANCE, declaredAppearance } from "../page/declaredAppearance";
import { isHere } from "../page/isHere";
import { renderMain, type Ran } from "../page/renderMain";

export type GoTo = (route: string, push?: boolean) => boolean;

export interface Navigation {
  /** Moves to a page: the address changes, and so does where the shell is. */
  readonly goTo: GoTo;
  /** Shows a page in the viewer, opened with the command that asked for it; the address and the shell stay. */
  readonly view: (route: string, ran: Ran) => boolean;
}

/**
 * Moving between pages without leaving the one that is open. The markdown is
 * already here and so is the renderer, so a link or a `cd` only has to swap
 * what is inside `<main>`; the header, the planet and the shell stay put.
 * Anything not in the site — a PDF, another site — is a real navigation.
 *
 * `onShow` is told every time the viewer changes, and whether the reader
 * moved to get there or only looked.
 */
export function mountNavigation(site: Site, onShow: (page: Page, moved: boolean) => void): Navigation {
  const main = document.querySelector("main");
  if (!main) return { goTo: () => false, view: () => false };

  const show = (page: Page, ran?: Ran) => {
    main.innerHTML = renderMain(site, page, ran);
    // What the page declares about how it looks; what that means is the features' business.
    const declared = declaredAppearance(page);
    for (const attribute of APPEARANCE) {
      const value = declared[attribute];
      if (value) document.documentElement.setAttribute(attribute, value);
      else document.documentElement.removeAttribute(attribute);
    }
    for (const link of document.querySelectorAll<HTMLAnchorElement>("nav .navlink")) {
      const here = isHere(page.route, link.getAttribute("href") ?? "\0");
      if (here) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    window.scrollTo({ top: 0 });
  };

  const goTo: GoTo = (route, push = true) => {
    const page = site.at(route);
    if (!page) return false;
    show(page);
    document.title = page.route === "/" ? "David Rodenas" : `${page.title} — David Rodenas`;
    if (push) window.history.pushState({ route }, "", route);
    window.goatcounter?.count?.({ path: route, title: document.title });
    onShow(page, true);
    return true;
  };

  const view = (route: string, ran: Ran) => {
    const page = site.at(route);
    if (!page) return false;
    show(page, ran);
    onShow(page, false);
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
    goTo(route, false);
  });

  return { goTo, view };
}
