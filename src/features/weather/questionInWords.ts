import type { WeatherQuestion } from "./WeatherQuestion";
import { weatherVariables } from "./weatherVariables";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** The question as a caption says it, so that no chart stands without what it counts. */
export function questionInWords(question: WeatherQuestion): string {
  const { name, unit } = weatherVariables[question.variable];
  const article = question.variable === "pi" ? "" : "a ";
  const side = question.atLeast ? `of ${question.threshold} ${unit} or more` : `below ${question.threshold} ${unit}`;
  const first = MONTHS[question.months[0] ?? 0];
  const last = MONTHS[question.months[question.months.length - 1] ?? 11];
  const when = question.months.length === 12 ? "whole year" : `${first} to ${last}`;
  return `days with ${article}${name} ${side}, ${when}`;
}
