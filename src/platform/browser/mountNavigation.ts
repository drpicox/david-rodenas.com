import type { Site } from "../content/Site";
import { renderMain } from "../page/renderMain";
import { settleTheme } from "./settleTheme";

export type GoTo = (route: string, push?: boolean) => boolean;

/**
 * Moving between pages without leaving the one that is open. The markdown is
 * already here and so is the renderer, so a link or a `cd` only has to swap
 * what is inside `<main>`; the header, the planet and the shell stay put.
 * Anything not in the site — a PDF, another site — is a real navigation.
 */
export function mountNavigation(site: Site, onArrive: (route: string) => void): GoTo {
  const main = document.querySelector("main");
  if (!main) return () => false;

  const goTo: GoTo = (route, push = true) => {
    const page = site.at(route);
    if (!page) return false;
    main.innerHTML = renderMain(site, page);
    const root = document.documentElement;
    const theme = page.fields["theme"];
    if (theme === "dark" || theme === "light") root.dataset["pageTheme"] = theme;
    else delete root.dataset["pageTheme"];
    if (page.fields["sky"]) root.dataset["sky"] = page.fields["sky"];
    else delete root.dataset["sky"];
    settleTheme();
    document.title = page.route === "/" ? "David Rodenas" : `${page.title} — David Rodenas`;
    for (const link of document.querySelectorAll<HTMLAnchorElement>("nav .navlink")) {
      const here = route.startsWith(link.getAttribute("href") ?? "\0");
      if (here) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    if (push) {
      window.history.pushState({ route }, "", route);
      window.scrollTo({ top: 0 });
    }
    window.goatcounter?.count?.({ path: route, title: document.title });
    onArrive(route);
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

  return goTo;
}
