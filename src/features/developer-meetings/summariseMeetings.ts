import { DAYS_PER_WEEK, HOURS_PER_DAY, type MeetingsParameters, type WorkHour } from "./simulateMeetings";

export interface DaySummary {
  readonly productivity: number;
  readonly features: number;
  readonly meetings: number;
}

/** `[hour][day]`, averaged over the weeks — except features, which are counted. */
export interface HourGrids {
  readonly focus: number[][];
  readonly fatigue: number[][];
  readonly productivity: number[][];
  readonly features: number[][];
}

export interface MeetingsSummary {
  readonly totalFeatures: number;
  readonly totalProductivity: number;
  readonly averageFeaturesPerWeek: number;
  readonly averageProductivityPerWeek: number;
  readonly days: readonly DaySummary[];
  readonly hours: HourGrids;
}

function grid(): number[][] {
  return Array.from({ length: HOURS_PER_DAY }, () => new Array<number>(DAYS_PER_WEEK).fill(0));
}

function bump(cells: number[][], { hour, day }: WorkHour, amount: number): void {
  const row = cells[hour];
  if (row) row[day] = (row[day] ?? 0) + amount;
}

/** The numbers a person reads off a run: totals, the shape of a week, the shape of a day. */
export function summariseMeetings(
  hours: readonly WorkHour[],
  { featureSize, weeks }: Pick<MeetingsParameters, "featureSize" | "weeks">,
): MeetingsSummary {
  const last = hours[hours.length - 1];
  const completed = last?.completedFeatures ?? 0;
  const carried = last?.accumulatedProductivity ?? 0;
  const totalFeatures = completed + Math.round((10 * carried) / featureSize) / 10;
  const totalProductivity = completed * featureSize + carried;

  const days = Array.from({ length: DAYS_PER_WEEK }, () => ({ productivity: 0, features: 0, meetings: 0 }));
  const sums: HourGrids = { focus: grid(), fatigue: grid(), productivity: grid(), features: grid() };

  for (const hour of hours) {
    const day = days[hour.day]!;
    day.productivity += hour.hourProductivity;
    if (hour.featureCompleted) day.features += 1;
    if (hour.inMeeting) day.meetings += 1;

    bump(sums.focus, hour, hour.hourFocus);
    bump(sums.fatigue, hour, hour.hourFatigue);
    bump(sums.productivity, hour, hour.hourProductivity);
    if (hour.featureCompleted) bump(sums.features, hour, 1);
  }

  const average = (cells: number[][]) => cells.map((row) => row.map((sum) => (weeks > 0 ? sum / weeks : 0)));

  return {
    totalFeatures,
    totalProductivity,
    averageFeaturesPerWeek: weeks > 0 ? totalFeatures / weeks : 0,
    averageProductivityPerWeek: weeks > 0 ? totalProductivity / weeks : 0,
    days,
    hours: { focus: average(sums.focus), fatigue: average(sums.fatigue), productivity: average(sums.productivity), features: sums.features },
  };
}
