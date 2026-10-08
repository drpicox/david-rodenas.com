/**
 * What the Meteocat serves for one of its long series, made for tests: the
 * header it writes, then a day a row — the date, the rain, the highest and
 * the lowest temperature, and the hours of sun where the series has them,
 * written as it writes a value it has not got.
 */
export function cadtepAnswer(name: string, days: readonly (readonly [date: string, pp: number, tx: number, tn: number])[], sun = false): string {
  const header = [
    "SERVEI METEOROLÒGIC DE CATALUNYA",
    `Nom de la sèrie: ${name}`,
    "Comarca: BARCELONÈS",
    "Codi sèrie: baic0000d",
    "Variable1: PRECIPITACIÓ ACUMULADA DIÀRIA (PPT, en mm)",
    "Variable2: TEMPERATURA MÀXIMA DIÀRIA (TX, en ºC)",
    "Variable3: TEMPERATURA MÍNIMA DIÀRIA (TN, en ºC)",
    ...(sun ? ["Variable4: INSOLACIÓ DIÀRIA (INS, en h)"] : []),
    "Z UTM31: 412 m",
    " ",
    ["ANY", "MES", "DIA", "PPT", "TX", "TN", ...(sun ? ["INS"] : [])].join("\t"),
  ];
  const rows = days.map(([date, pp, tx, tn]) => [Number(date.slice(0, 4)), Number(date.slice(5, 7)), Number(date.slice(8, 10)), pp, tx, tn, ...(sun ? ["-999.9"] : [])].join("\t"));
  return [...header, ...rows, ""].join("\n");
}
