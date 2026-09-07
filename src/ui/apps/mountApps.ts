import { mountDeveloperMeetings } from "./developerMeetings";
import { mountTechnicalDebt } from "./technicalDebt";
import { mountWorlds } from "./worlds";

type Unmount = () => void;

const APPS: Record<string, (host: HTMLElement) => Unmount | void> = {
  "technical-debt": mountTechnicalDebt,
  "developer-meetings": mountDeveloperMeetings,
  worlds: mountWorlds,
};

/** A `::name` in the markdown became a `.app`; the program named goes in it. Returns how to stop them all. */
export function mountApps(): Unmount {
  const stops: Unmount[] = [];
  for (const host of document.querySelectorAll<HTMLElement>(".app[data-app]")) {
    const mount = APPS[host.dataset["app"] ?? ""];
    const stop = mount?.(host);
    if (stop) stops.push(stop);
  }
  return () => {
    for (const stop of stops) stop();
  };
}
