/**
 * A number as a person reads it off a picture: whole when it is whole, with
 * three figures that matter when it is not, and a real minus sign. Only ever
 * for showing: a blueprint's text keeps its numbers as they were written.
 */
export function numberSaid(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const size = Math.abs(value);
  const decimals = Number.isInteger(value) ? 0 : size >= 100 ? 1 : size >= 1 ? 2 : Math.max(0, 2 - Math.floor(Math.log10(size)));
  const written = String(Number(size.toFixed(decimals)));
  return value < 0 && written !== "0" ? `−${written}` : written;
}
