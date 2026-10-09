/** How the Meteocat writes a month it has no value for: far below any mean or any rain a month of Barcelona has had. */
const ABSENT = -99;

/**
 * A value for each month of every year of one of Barcelona's series — the
 * mean temperature, or the rain — January to December, from the text the
 * Meteocat serves: a header about the series, a line naming the columns — the
 * year, then the months by their initials — and a year a row, oldest first.
 * Anything else is refused.
 */
export function monthlyValuesOf(text: string): Map<number, (number | null)[]> {
  const lines = text.split(/\r?\n/);
  const head = lines.findIndex((line) => line.startsWith("ANY\t"));
  if (head < 0) throw new Error("the answer is not the series: it names no columns");
  const years = new Map<number, (number | null)[]>();
  for (const line of lines.slice(head + 1)) {
    if (line.trim() === "") continue;
    const [label, ...cells] = line.trim().split("\t");
    const year = Number(label);
    if (!Number.isInteger(year)) throw new Error(`the series has a row that is not a year: ${label}`);
    if (cells.length !== 12) throw new Error(`${year} has ${cells.length} months, not 12`);
    if (years.has(year)) throw new Error(`the series has ${year} twice`);
    years.set(
      year,
      cells.map((cell) => {
        const value = Number(cell);
        return Number.isFinite(value) && value > ABSENT ? value : null;
      }),
    );
  }
  return years;
}
