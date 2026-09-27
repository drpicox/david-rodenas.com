import "./styles.css";
import { allFeatures } from "./features/allFeatures";
import { appsOf } from "./platform/browser/appsOf";
import { eventName } from "./platform/analytics/eventName";
import { BrowserFlags } from "./platform/browser/BrowserFlags";
import { countEvent } from "./platform/browser/countEvent";
import { modelContextHere } from "./platform/browser/modelContextHere";
import { mountApps } from "./platform/browser/mountApps";
import { mountNavigation } from "./platform/browser/mountNavigation";
import { mountTerminal, type Terminal } from "./platform/browser/mountTerminal";
import { offerTools } from "./platform/browser/offerTools";
import { siteInBrowser } from "./platform/browser/siteInBrowser";
import { flagsCommand } from "./platform/flags/flagsCommand";
import { enterTrials } from "./platform/flags/enterTrials";
import { flagsInAddress } from "./platform/flags/flagsInAddress";
import { commandsOf } from "./platform/plugin/commandsOf";
import { siteCommands } from "./platform/shell/commands/siteCommands";

/**
 * The composition root, and the only file allowed to know that there is more
 * than one feature. Everything here is an improvement on a page that already
 * works: the words arrived in the HTML, and this collects what the features
 * brought, wires the prompt to the shell, and starts them.
 */
function mount(): void {
  // The trials: what a link asks for is kept, and the command switches the rest.
  const flags = allFeatures.flatMap((feature) => feature.flags ?? []);
  const flagStore = new BrowserFlags();
  for (const [name, on] of Object.entries(flagsInAddress(flags, window.location.search))) flagStore.set(name, on);

  // A reader in a trial is counted once a visit under the side they are on, and so is what they open from the home.
  const trials = enterTrials(flags, flagStore, Math.random);
  const sideOf = (trial: { name: string; on: boolean }) => `${trial.name}-${trial.on ? "on" : "off"}`;
  for (const trial of trials) countEvent(eventName("trial", sideOf(trial)));
  document.addEventListener(
    "click",
    (event) => {
      const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("main a[href]");
      if (!anchor || window.location.pathname !== "/" || trials.length === 0) return;
      const href = anchor.host === window.location.host ? anchor.pathname : anchor.href;
      for (const trial of trials) countEvent(eventName(sideOf(trial), "open", href));
    },
    { capture: true },
  );

  const commands = [...siteCommands, ...commandsOf(allFeatures), flagsCommand(flags, flagStore)];
  const apps = appsOf(allFeatures);

  const here = (path: string) => (path.endsWith("/") ? path : `${path}/`);
  const route = here(window.location.pathname);
  const page = siteInBrowser.at(route);

  // A page change swaps <main>: the programs on the old one stop, the ones on the new one start.
  let stopApps = mountApps(apps, { site: siteInBrowser });
  let terminal: Terminal | null = null;
  const goTo = mountNavigation(siteInBrowser, (arrived, kept) => {
    stopApps();
    stopApps = mountApps(apps, { site: siteInBrowser });
    for (const feature of allFeatures) feature.arrive?.(arrived);
    // A move the shell made itself is not news to the shell; a link's is.
    if (!kept) terminal?.moveTo(arrived.route);
  });

  // clear takes the page off the paper too, and the programs on it stop with it.
  const clearPage = () => {
    stopApps();
    stopApps = () => {};
    document.querySelector("main")?.replaceChildren();
  };
  // What is run at the prompt is counted by the command's name alone: what follows it is whatever the reader typed, and stays theirs.
  const heard = (word: string) => countEvent(eventName("command", commands.some((command) => command.name === word) ? word : "unknown"));
  terminal = mountTerminal(siteInBrowser, page ? route : "/", { moveTo: (route) => goTo(route, { keep: true }), clearPage, commands, heard });

  // A feature that has something to say about the page it started on says it now.
  if (page) for (const feature of allFeatures) feature.arrive?.(page);
  const prompt = { run: (line: string) => void terminal?.run(line) };
  for (const feature of allFeatures) feature.install?.(prompt);

  // An agent in the reader's browser is offered what the reader is: the programs, and the prompt.
  const programs = allFeatures.flatMap((feature) => feature.programs ?? []);
  offerTools(modelContextHere(), { programs, site: siteInBrowser, goTo: (route) => goTo(route), run: (line) => terminal?.run(line) ?? [] });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
