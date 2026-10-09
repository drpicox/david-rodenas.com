import type { Credit } from "../../../platform/blueprint/Table";
import type { SourceIndex } from "../../../platform/data/renderSourceLine";
import type { BarcelonaSeries } from "../BarcelonaSeries";

/** Where each of Barcelona's series is kept: a directory of its own, with its own index, because each is credited to its own paper. */
const KEPT = { temperature: "/data/barcelona-series/temperature.json", rain: "/data/barcelona-rain/rain.json" } as const;

/** One of Barcelona's series as the site keeps it, and who to credit for it: the Meteocat, with its paper, and the day the copy was last brought up to date. */
export function barcelonaRead(read: (path: string) => string, which: keyof typeof KEPT): { series: BarcelonaSeries; credit: Credit } {
  const series = JSON.parse(read(KEPT[which])) as BarcelonaSeries;
  const index = JSON.parse(read(KEPT[which].replace(/[^/]+$/, "index.json"))) as SourceIndex;
  return { series, credit: { said: index.attribution, refreshed: index.refreshed } };
}
