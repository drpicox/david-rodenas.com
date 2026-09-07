export interface MeetingType {
  /** Added to the hour's focus when this meeting happens; usually negative. */
  readonly focus: number;
  /** Added to the hour's fatigue; a break is a meeting with negative fatigue. */
  readonly fatigue: number;
}

export type MeetingTypes = Readonly<Record<string, MeetingType>>;

/** `"day-hour"` (0–4, 0–7) to the name of the meeting there. */
export type Calendar = Readonly<Record<string, string>>;

export interface MeetingsParameters {
  readonly focus: number;
  readonly fatigue: number;
  readonly featureSize: number;
  readonly weeks: number;
  readonly calendar: Calendar;
  readonly meetingTypes: MeetingTypes;
}

export interface WorkHour {
  readonly week: number;
  readonly day: number;
  readonly hour: number;
  readonly inMeeting: boolean;
  readonly hourFocus: number;
  readonly hourFatigue: number;
  readonly hourProductivity: number;
  readonly accumulatedProductivity: number;
  readonly completedFeatures: number;
  readonly featureCompleted: boolean;
}

export const DAYS_PER_WEEK = 5;
export const HOURS_PER_DAY = 8;

const clamp = (value: number): number => Math.max(0, Math.min(100, value));

/**
 * A developer's week, hour by hour. Focus builds through a day and so does
 * fatigue; what gets done in an hour is the difference. A meeting produces
 * nothing and moves both dials by what that kind of meeting does to a person.
 * A feature is finished when the hours add up to its size, and finishing one
 * costs the focus that was built up for it.
 */
export function simulateMeetings(parameters: MeetingsParameters): WorkHour[] {
  const { focus, fatigue, featureSize, weeks, calendar, meetingTypes } = parameters;
  const hours: WorkHour[] = [];
  let accumulatedProductivity = 0;
  let completedFeatures = 0;

  for (let week = 0; week < weeks; week += 1) {
    for (let day = 0; day < DAYS_PER_WEEK; day += 1) {
      let hourFocus = 0;
      let hourFatigue = 0;

      for (let hour = 0; hour < HOURS_PER_DAY; hour += 1) {
        const meeting = meetingTypes[calendar[`${day}-${hour}`] ?? ""];
        if (meeting) {
          hourFocus = clamp(hourFocus + meeting.focus);
          hourFatigue = clamp(hourFatigue + meeting.fatigue);
          hours.push({ week, day, hour, inMeeting: true, hourFocus, hourFatigue, hourProductivity: 0, accumulatedProductivity, completedFeatures, featureCompleted: false });
          continue;
        }

        hourFocus = clamp(hourFocus + focus);
        hourFatigue = clamp(hourFatigue + fatigue);
        const possible = clamp(hourFocus - hourFatigue);
        const remaining = featureSize - accumulatedProductivity;
        const featureCompleted = possible > remaining;

        const hourProductivity = featureCompleted ? remaining : possible;
        if (featureCompleted) {
          completedFeatures += 1;
          accumulatedProductivity = 0;
        } else {
          accumulatedProductivity += hourProductivity;
        }

        hours.push({ week, day, hour, inMeeting: false, hourFocus, hourFatigue, hourProductivity, accumulatedProductivity, completedFeatures, featureCompleted });
        if (featureCompleted) hourFocus = 0;
      }
    }
  }

  return hours;
}
