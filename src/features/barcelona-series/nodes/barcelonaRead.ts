import type { Credit } from "../../../platform/blueprint/Table";
import type { SourceIndex } from "../../../platform/data/renderSourceLine";
import type { BarcelonaSeries } from "../BarcelonaSeries";

/** Barcelona's series as the site keeps it, and who to credit for it: the Meteocat, and the day the copy was last brought up to date. */
export function barcelonaRead(read: (path: string) => string): { series: BarcelonaSeries; credit: Credit } {
  const series = JSON.parse(read("/data/barcelona-series/temperature.json")) as BarcelonaSeries;
  const index = JSON.parse(read("/data/barcelona-series/index.json")) as SourceIndex;
  return { series, credit: { said: index.attribution, refreshed: index.refreshed } };
}
