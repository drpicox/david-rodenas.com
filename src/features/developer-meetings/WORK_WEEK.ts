const FIRST_HOUR = 9;
const HOURS_A_DAY = 8;

/** The week the model paints meetings on: five days of eight hours, from nine, and their names as the calendar heads them. */
export const WORK_WEEK = {
  days: 5,
  hoursADay: HOURS_A_DAY,
  dayNames: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  hourNames: Array.from({ length: HOURS_A_DAY }, (_, hour) => `${FIRST_HOUR + hour}:00`),
} as const;
