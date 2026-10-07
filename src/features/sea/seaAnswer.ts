/** The days of OISST are counted from the first of January of 1800. */
const EPOCH = Date.UTC(1800, 0, 1);
const DAY = 86_400_000;
const LATS = [40.625, 40.875, 41.125, 41.375, 41.625, 41.875, 42.125];
const LONS = [0.875, 1.125, 1.375, 1.625, 1.875, 2.125, 2.375, 2.625, 2.875, 3.125, 3.375];

/**
 * What the server answers, made for tests: some days of a year over the box
 * of cells around the four points, in the server's own words — the values a
 * row of longitudes at a time, then the days, the latitudes and the
 * longitudes. A value it does not have is written as the server writes it.
 */
export function seaAnswer(year: number, from: number, count: number, value: (day: number, lat: number, lon: number) => number | null): string {
  const first = (Date.UTC(year, 0, 1) - EPOCH) / DAY + from;
  const rows = Array.from({ length: count }, (_, t) => LATS.map((lat, la) => `[${t}][${la}], ${LONS.map((lon) => value(from + t, lat, lon) ?? "-9.96921E36").join(", ")}`)).flat();
  return [
    "Dataset {",
    "    Grid {",
    "    } sst;",
    "} Datasets/noaa.oisst.v2.highres/sst.day.mean.nc;",
    "---------------------------------------------",
    `sst.sst[${count}][${LATS.length}][${LONS.length}]`,
    ...rows,
    "",
    `sst.time[${count}]`,
    Array.from({ length: count }, (_, t) => `${first + t}.0`).join(", "),
    "",
    `sst.lat[${LATS.length}]`,
    LATS.join(", "),
    "",
    `sst.lon[${LONS.length}]`,
    LONS.join(", "),
    "",
  ].join("\n");
}
