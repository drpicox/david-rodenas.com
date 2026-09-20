/** What of a station is being looked at: a run of years, and which days of the week. */
export interface No2Selection {
  readonly from: number;
  readonly to: number;
  readonly days: "all" | "workdays" | "weekends";
}
