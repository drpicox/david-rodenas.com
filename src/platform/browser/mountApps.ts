import type { App, Surroundings } from "../plugin/Feature";

/** A `::name` in the markdown became a `.app`; the program named goes in it. Returns how to stop them all. */
export function mountApps(apps: Readonly<Record<string, App>>, surroundings: Surroundings): () => void {
  const stops: (() => void)[] = [];
  for (const host of document.querySelectorAll<HTMLElement>(".app[data-app]")) {
    const stop = apps[host.dataset["app"] ?? ""]?.(host, surroundings);
    if (stop) stops.push(stop);
  }
  return () => {
    for (const stop of stops) stop();
  };
}
