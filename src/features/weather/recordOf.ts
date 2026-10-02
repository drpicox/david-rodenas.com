import type { WeatherQuestion } from "./WeatherQuestion";
import type { WeatherStation } from "./WeatherStation";

/** The most extreme day a station has, on the side the question looks at, whatever months are asked: what no histogram could keep. */
export function recordOf(station: WeatherStation, question: WeatherQuestion): { readonly value: number; readonly date: string } | null {
  const records = Object.values(station.years).flatMap((year) => (year[question.variable] ? [year[question.variable]!.record] : []));
  if (records.length === 0) return null;
  const sides = records.map(([high, highOn, low, lowOn]) => (question.atLeast ? { value: high, date: highOn } : { value: low, date: lowOn }));
  return sides.reduce((a, b) => ((question.atLeast ? b.value > a.value : b.value < a.value) ? b : a));
}
