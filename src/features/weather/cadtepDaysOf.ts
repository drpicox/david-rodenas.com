/** A day of a long series: its rain, its highest and its lowest temperature — nothing where the series has no value. */
export interface CadtepDay {
  readonly date: string;
  readonly pp: number | null;
  readonly tx: number | null;
  readonly tn: number | null;
}

/** How the Meteocat writes a value it has not got: far below anything a thermometer or a rain gauge can read. */
const ABSENT = -99;

const padded = (part: string | undefined) => (part ?? "").trim().padStart(2, "0");

/**
 * The days of one of the Meteocat's long series, from the text it serves: a
 * header about the series, a line naming the columns — the year, the month,
 * the day, the rain, the highest and lowest temperature, and the hours of
 * sun in some — then a day a row, oldest first. Anything else is refused.
 */
export function cadtepDaysOf(text: string): CadtepDay[] {
  const lines = text.split(/\r?\n/);
  const head = lines.findIndex((line) => line.startsWith("ANY\t"));
  if (head < 0) throw new Error("the answer is not a series of the Meteocat: it names no columns");
  const columns = (lines[head] ?? "").trim().split("\t");
  const at = (name: string) => columns.indexOf(name);
  const [pp, tx, tn] = [at("PPT"), at("TX"), at("TN")];
  if (pp < 0 || tx < 0 || tn < 0) throw new Error(`the series has no ${["PPT", "TX", "TN"].filter((name) => at(name) < 0).join(", ")}`);

  const value = (cells: readonly string[], index: number) => {
    const read = Number(cells[index]);
    return Number.isFinite(read) && read > ABSENT ? read : null;
  };
  const days: CadtepDay[] = [];
  for (const line of lines.slice(head + 1)) {
    if (line.trim() === "") continue;
    const cells = line.trim().split("\t");
    const date = `${cells[0]}-${padded(cells[1])}-${padded(cells[2])}`;
    const last = days.at(-1)?.date ?? "";
    if (date === last) throw new Error(`the series has ${date} twice`);
    if (date < last) throw new Error(`the series is out of order: ${date} comes after ${last}`);
    days.push({ date, pp: value(cells, pp), tx: value(cells, tx), tn: value(cells, tn) });
  }
  return days;
}
