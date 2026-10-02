import { el } from "../../../platform/browser/el";
import { PROGRAM_ASKED } from "../../../platform/browser/PROGRAM_ASKED";
import { runningAt } from "../../../platform/browser/runningAt";
import type { Values } from "../../../platform/program/Values";
import { sourceLineOf } from "../../../platform/browser/sourceLineOf";
import { withSoFar, type WithSoFar } from "../../../platform/data/withSoFar";
import { firstQuestion } from "../firstQuestion";
import { renderWeatherFigure } from "../renderWeatherFigure";
import { weatherPresets } from "../weatherPresets";
import type { WeatherQuestion } from "../WeatherQuestion";
import type { WeatherStation } from "../WeatherStation";
import { weatherStations } from "../weatherStations";
import { weatherVariables } from "../weatherVariables";

const SEASONS: readonly (readonly [string, readonly number[]])[] = [
  ["whole year", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
  ["June to August", [5, 6, 7]],
  ["May to October", [4, 5, 6, 7, 8, 9]],
  ["December to February", [0, 1, 11]],
];

/** How far the threshold slides for each variable: the range where the counts are not all or nothing. */
const SLIDE = { tn: [-10, 30], tx: [0, 45], pp: [0.5, 100], pi: [0.5, 60] } as const;

/**
 * The figure the build already wrote, with the question put above it: where,
 * what kind of day, how much of it, and when in the year. The threshold is a
 * slider because the files hold histograms, not counts: moving it asks the
 * portal nothing and the server nothing.
 */
export function mountWeather(host: HTMLElement): () => void {
  const held = new Map<string, Promise<WeatherStation>>();
  const running = runningAt<WeatherStation>("/data/weather/running.json");
  const source = sourceLineOf(host, "/data/weather/index.json", "/data/weather/running.json");
  const figure = el("div");
  figure.append(...host.querySelectorAll("figure"));

  let station: WithSoFar<WeatherStation> | null = null;
  let question: WeatherQuestion = firstQuestion;
  let stopped = false;

  const option = (value: string | number, label: string) => el("option", { value }, label);
  const stationSelect = el("select", { onchange: () => void choose(stationSelect.value) }, ...weatherStations.map(({ code, name }) => option(code, name)));
  const presetSelect = el(
    "select",
    {
      onchange: () => {
        const preset = weatherPresets.find(({ id }) => id === presetSelect.value);
        if (preset) ask({ variable: preset.variable, atLeast: preset.atLeast, threshold: preset.threshold });
      },
    },
    ...weatherPresets.map(({ id, name }) => option(id, name)),
  );
  const seasonSelect = el("select", { onchange: () => ask({ months: SEASONS[Number(seasonSelect.value)]?.[1] ?? firstQuestion.months }) }, ...SEASONS.map(([label], index) => option(index, label)));
  const shown = el("output");
  const slider = el("input", { type: "range", step: 0.5, oninput: () => ask({ threshold: Number(slider.value) }) });

  function draw(): void {
    const [min, max] = SLIDE[question.variable];
    slider.min = String(min);
    slider.max = String(max);
    slider.value = String(question.threshold);
    shown.textContent = `${question.atLeast ? "" : "below "}${question.threshold} ${weatherVariables[question.variable].unit}${question.atLeast ? " or more" : ""}`;
    if (station) figure.innerHTML = renderWeatherFigure(station, question);
  }

  function ask(next: Partial<WeatherQuestion>): void {
    question = { ...question, ...next };
    draw();
  }

  async function choose(code: string): Promise<void> {
    const asked = held.get(code) ?? fetch(`/data/weather/${code}.json`).then((response) => response.json() as Promise<WeatherStation>);
    held.set(code, asked);
    try {
      const [arrived, soFar] = await Promise.all([asked, running]);
      if (stopped || stationSelect.value !== code) return;
      station = withSoFar(arrived, soFar, `${code}.json`);
      draw();
    } catch {
      held.delete(code);
      figure.replaceChildren(el("p", {}, "The measurements for this station did not arrive. The rest of the page does not depend on them."));
    }
  }

  // An agent's question, put to the page the way a reader would put it: every list and the slider show what was asked.
  host.addEventListener(PROGRAM_ASKED, (event) => {
    const { station: code, kind, threshold, months } = (event as CustomEvent<Values>).detail;
    const preset = weatherPresets.find(({ id }) => id === kind);
    if (!preset) return;
    const asked = String(months).split(",").map(Number);
    presetSelect.value = preset.id;
    const season = SEASONS.findIndex(([, of]) => of.join(",") === asked.join(","));
    if (season >= 0) seasonSelect.value = String(season);
    question = { variable: preset.variable, atLeast: preset.atLeast, threshold: Number(threshold), months: asked };
    stationSelect.value = String(code);
    void choose(stationSelect.value);
  });

  const controls = el(
    "div",
    { class: "dials" },
    el("label", {}, "Station", stationSelect),
    el("label", {}, "Counting", presetSelect),
    el("label", {}, "Threshold: ", shown, slider),
    el("label", {}, "Months", seasonSelect),
  );
  host.replaceChildren(controls, figure, source);
  void choose(stationSelect.value);

  return () => {
    stopped = true;
  };
}
