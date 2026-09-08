export interface TechnicalDebtParameters {
  /** Days a feature takes when it is done properly. */
  readonly baseTime: number;
  /** Share of that time a shortcut saves, at first. */
  readonly shortcutFactor: number;
  /** How much dearer every feature makes the next one, on the shortcut road. */
  readonly interestRate: number;
  /** Months to look ahead. */
  readonly timeHorizon: number;
}

export interface TechnicalDebtMonth {
  readonly month: number;
  readonly cleanCumulative: number;
  readonly debtCumulative: number;
  readonly cleanMonthly: number;
  readonly debtMonthly: number;
  /** What the next shortcut feature would cost, in days. */
  readonly debtFeatureCost: number;
}

export interface TechnicalDebtOutcome {
  readonly months: readonly TechnicalDebtMonth[];
  /** The first month the clean road has delivered more, or null if it never does in time. */
  readonly breakEvenMonth: number | null;
}

const DAYS_PER_MONTH = 20;

/**
 * Two teams build the same features. One takes the time each needs. The other
 * cuts corners and pays interest: every feature it ships makes the next one
 * dearer by the same factor. Day by day, this counts what each has delivered.
 */
export function simulateTechnicalDebt(parameters: TechnicalDebtParameters): TechnicalDebtOutcome {
  const { baseTime, shortcutFactor, interestRate, timeHorizon } = parameters;
  const months: TechnicalDebtMonth[] = [];
  let breakEvenMonth: number | null = null;

  const cleanFeatureCost = baseTime;
  let debtFeatureCost = baseTime * (1 - shortcutFactor);
  let cleanCumulative = 0;
  let debtCumulative = 0;
  let cleanMonthly = 0;
  let debtMonthly = 0;
  let nextCleanDay = 0;
  let nextDebtDay = 0;

  for (let today = 0; today < timeHorizon * DAYS_PER_MONTH; ) {
    while (nextCleanDay <= today) {
      cleanCumulative += 1;
      cleanMonthly += 1;
      nextCleanDay += cleanFeatureCost;
    }
    while (nextDebtDay <= today) {
      debtCumulative += 1;
      debtMonthly += 1;
      nextDebtDay += debtFeatureCost;
      debtFeatureCost *= 1 + interestRate;
    }

    today += 1;
    if (today % DAYS_PER_MONTH === 0) {
      const month = today / DAYS_PER_MONTH;
      months.push({ month, cleanCumulative, debtCumulative, cleanMonthly, debtMonthly, debtFeatureCost });
      cleanMonthly = 0;
      debtMonthly = 0;
      if (breakEvenMonth === null && cleanCumulative > debtCumulative) breakEvenMonth = month;
    }
  }

  return { months, breakEvenMonth };
}
