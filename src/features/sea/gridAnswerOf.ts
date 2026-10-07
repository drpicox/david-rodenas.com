/** A grid as the server answers it: the days, counted from 1800, the latitudes, the longitudes, and a value — or nothing, over land — for each. */
export interface GridAnswer {
  readonly times: readonly number[];
  readonly lats: readonly number[];
  readonly lons: readonly number[];
  /** By day, then latitude, then longitude. */
  readonly values: readonly (readonly (readonly (number | null)[])[])[];
}

/** What the server writes where a cell has no sea: a fill far below any temperature. */
const LAND = -1e30;

const numbersOf = (line: string | undefined) => (line ?? "").split(",").map((each) => Number(each.trim()));

/**
 * The words an OPeNDAP server answers a grid with, as numbers: a header, the
 * values a row of longitudes at a time — `[day][latitude], v, v, …` — then
 * each axis, named and given on the line after. An answer that is an error
 * is thrown, in the server's own words.
 */
export function gridAnswerOf(text: string, variable = "sst"): GridAnswer {
  const refused = /message\s*=\s*"([^"]*)"/.exec(text);
  if (text.trimStart().startsWith("Error") || refused) throw new Error(refused?.[1] ?? "the server answered with an error");
  const lines = text.split("\n");
  const axis = (name: string) => numbersOf(lines[lines.findIndex((line) => line.startsWith(`${variable}.${name}[`)) + 1]);
  const start = lines.findIndex((line) => line.startsWith(`${variable}.${variable}[`));
  if (start < 0) throw new Error(`the answer has no ${variable}`);
  const [days = 0, latitudes = 0] = [...(lines[start] ?? "").matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1]));
  const values = Array.from({ length: days }, (_, day) =>
    Array.from({ length: latitudes }, (_, lat) => {
      const line = lines[start + 1 + day * latitudes + lat] ?? "";
      if (!line.startsWith(`[${day}][${lat}],`)) throw new Error(`the answer breaks off at day ${day}`);
      return numbersOf(line.slice(line.indexOf(",") + 1)).map((value) => (Number.isFinite(value) && value > LAND ? value : null));
    }),
  );
  return { times: axis("time"), lats: axis("lat"), lons: axis("lon"), values };
}
