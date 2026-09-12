import "./styles.css";
import { allFeatures } from "./features/allFeatures";
import { mountApps } from "./platform/browser/mountApps";
import { mountNavigation } from "./platform/browser/mountNavigation";
import { mountTerminal, type Terminal } from "./platform/browser/mountTerminal";
import { siteInBrowser } from "./platform/browser/siteInBrowser";
import { siteCommands } from "./platform/shell/commands/siteCommands";

/**
 * The composition root, and the only file allowed to know that there is more
 * than one feature. Everything here is an improvement on a page that already
 * works: the words arrived in the HTML, and this collects what the features
 * brought, wires the prompt to the shell, and starts them.
 */
function mount(): void {
  const commands = [...siteCommands, ...allFeatures.flatMap((feature) => feature.commands ?? [])];
  const apps = Object.assign({}, ...allFeatures.map((feature) => feature.apps ?? {}));

  const here = (path: string) => (path.endsWith("/") ? path : `${path}/`);
  const route = here(window.location.pathname);
  const page = siteInBrowser.at(route);

  // A page change swaps <main>: the programs on the old one stop, the ones on the new one start.
  let stopApps = mountApps(apps);
  let terminal: Terminal | null = null;
  const goTo = mountNavigation(siteInBrowser, (arrived, kept) => {
    stopApps();
    stopApps = mountApps(apps);
    for (const feature of allFeatures) feature.arrive?.(arrived);
    // A move the shell made itself is not news to the shell; a link's is.
    if (!kept) terminal?.moveTo(arrived.route);
  });

  terminal = mountTerminal(siteInBrowser, page ? route : "/", { moveTo: (route) => goTo(route, { keep: true }), commands });

  // A feature that has something to say about the page it started on says it now.
  if (page) for (const feature of allFeatures) feature.arrive?.(page);
  const prompt = { run: (line: string) => terminal?.run(line) };
  for (const feature of allFeatures) feature.install?.(prompt);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
