import { yearBars } from "../../platform/charts/yearBars";
import { yearLine } from "../../platform/charts/yearLine";
import { daysPerYear } from "./daysPerYear";
import { questionInWords } from "./questionInWords";
import { renderDaysCalendar } from "./renderDaysCalendar";
import { twoHalves } from "./twoHalves";
import type { WeatherQuestion } from "./WeatherQuestion";
import type { WeatherStation } from "./WeatherStation";
import { weatherVariables } from "./weatherVariables";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SUMMARY_TITLES = { mean: "The mean", sum: "The total", max: "The highest" };

const oneDecimal = (value: number) => String(Math.round(value * 10) / 10);
const signed = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${oneDecimal(Math.abs(value))}`;
const dayInWords = (date: string) => `${Number(date.slice(8, 10))} ${MONTHS[Number(date.slice(5, 7)) - 1]} ${date.slice(0, 4)}`;

/** The most extreme day the station has, on the side the question looks at. */
function record(station: WeatherStation, question: WeatherQuestion): string {
  const { unit, name } = weatherVariables[question.variable];
  const records = Object.values(station.years).flatMap((year) => (year[question.variable] ? [year[question.variable]!.record] : []));
  const [value, date] = question.atLeast
    ? records.map(([high, on]) => [high, on] as const).reduce((a, b) => (b[0] > a[0] ? b : a))
    : records.map(([, , low, on]) => [low, on] as const).reduce((a, b) => (b[0] < a[0] ? b : a));
  return `<p class="record">The ${question.atLeast ? "highest" : "lowest"} ${name} on record here: ${value} ${unit} on ${dayInWords(date)}, whatever months are chosen.</p>`;
}

/**
 * The figure for one station and one question, as markup: the build writes it
 * into the page and the browser draws it again from this same function on
 * every change.
 */
export function renderWeatherFigure(station: WeatherStation, question: WeatherQuestion): string {
  const info = weatherVariables[question.variable];
  const caption = `<figcaption><strong>${station.name}</strong> · ${station.altitude} m, ${station.setting} · ${questionInWords(question)}</figcaption>`;
  const years = daysPerYear(station, question);
  if (years.length === 0) return `<figure class="weather">${caption}<p>This station has no ${info.name} on record.</p></figure>`;

  const halves = twoHalves(years);
  const period = ({ from, to }: { from: number; to: number }) => `${from}–${to}`;
  const figures = halves
    ? `<div class="figures">` +
      halves.map((half) => `<div><strong>${oneDecimal(half.days)}</strong>days a year, ${period(half)}</div>`).join("") +
      `<div><strong>${signed(halves[1].days - halves[0].days)}</strong>days a year, from one half to the other</div>` +
      `</div>`
    : "";

  const bars = years.map(({ year, days, elsewhere, measured, expected, whole }) => {
    const beyond = elsewhere > 0 ? `, and ${elsewhere} more outside the months chosen` : "";
    const holes = whole ? "" : `, with only ${measured} of ${expected} days measured`;
    return { year, value: days, partial: !whole, title: `${year}: ${days} days${holes}${beyond}` };
  });
  const daySpans = (halves ?? []).map((half) => ({ from: half.from, to: half.to, value: half.days, label: `${oneDecimal(half.days)} a year` }));

  // A mean of four months is not a year's mean, and nor is their total: a year with holes has no figure here.
  const summaries = years.flatMap(({ year, summary, whole }) => (summary === null || !whole ? [] : [{ year, value: summary, title: `${year}: ${oneDecimal(summary)} ${info.unit}` }]));
  const summarySpans = (halves ?? []).flatMap((half) => (half.summary === null ? [] : [{ from: half.from, to: half.to, value: half.summary, label: `${oneDecimal(half.summary)} ${info.unit}` }]));
  const summaryLabel = `${SUMMARY_TITLES[info.summary]} ${info.name} of each year, ${info.unit}`;
  const summaryChart = (info.summary === "mean" ? yearLine : yearBars)(summaries, { label: summaryLabel, spans: summarySpans });

  return (
    `<figure class="weather">${caption}${figures}` +
    `<h4>Days a year</h4>${yearBars(bars, { label: `Days a year: ${questionInWords(question)}`, spans: daySpans })}` +
    `<h4>When in the year they fell</h4>${renderDaysCalendar(years, question.atLeast && info.unit === "°C")}` +
    `<h4>${summaryLabel}, in the months chosen</h4>${summaryChart}` +
    record(station, question) +
    `</figure>`
  );
}
