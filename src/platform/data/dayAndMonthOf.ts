const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** A YYYY-MM-DD day as a sentence says it when the year goes without saying: how far a year still running reaches. */
export function dayAndMonthOf(date: string): string {
  return `${Number(date.slice(8, 10))} ${MONTHS[Number(date.slice(5, 7)) - 1]}`;
}
