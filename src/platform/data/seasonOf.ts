const SEASONS = ["winter", "winter", "spring", "spring", "spring", "summer", "summer", "summer", "autumn", "autumn", "autumn", "winter"] as const;

/** The season a month falls in, as meteorologists count them, in whole months: winter is December to February. Months are counted from 1. */
export function seasonOf(month: number): string {
  return SEASONS[(((Math.round(month) - 1) % 12) + 12) % 12] ?? "winter";
}
