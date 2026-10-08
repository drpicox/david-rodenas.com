/**
 * What the Meteocat serves for Barcelona's series since 1780, made for tests:
 * the header it writes, then a year a row, January to December, and a month
 * it has not got written as it writes one.
 */
export function barcelonaAnswer(years: Readonly<Record<number, readonly (number | null)[]>>): string {
  const header = [
    "SERVEI METEOROLÒGIC DE CATALUNYA",
    "Nom de la sèrie: BARCELONA",
    "Comarca: BARCELONÈS",
    "Variable: TEMPERATURA MITJANA MENSUAL (ºC)",
    "LAT (º): 41.41864 ",
    "LONG (º): 2.12379",
    "ALT (m): 411",
    "",
    "ANY\tG\tF\tM\tA\tM\tJ\tJ\tA\tS\tO\tN\tD",
  ];
  const rows = Object.entries(years).map(([year, months]) => [year, ...months.map((month) => month ?? "-999.9")].join("\t"));
  return [...header, ...rows, ""].join("\r\n");
}
