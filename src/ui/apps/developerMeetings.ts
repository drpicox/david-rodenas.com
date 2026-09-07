import {
  DAYS_PER_WEEK,
  HOURS_PER_DAY,
  simulateMeetings,
  type MeetingType,
} from "../../core/simulators/simulateMeetings";
import { summariseMeetings, type MeetingsSummary } from "../../core/simulators/summariseMeetings";
import { barChart } from "../charts/barChart";
import { el } from "../dom";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = Array.from({ length: HOURS_PER_DAY }, (_, hour) => `${9 + hour}:00`);

/** The feature-size slider is straight up to 500, then coarser, so both a task and an epic fit on it. */
function sliderToFeatureSize(value: number): number {
  if (value <= 500) return value;
  if (value <= 750) return 500 + (value - 500) * 2;
  if (value < 1000) return 1000 + (value - 750) * 35;
  return 10000;
}

function featureSizeToSlider(size: number): number {
  if (size <= 500) return size;
  if (size <= 1000) return 500 + (size - 500) / 2;
  if (size < 10000) return 750 + (size - 1000) / 35;
  return 1000;
}

function heatGrid(title: string, cells: readonly (readonly number[])[]): HTMLElement {
  const all = cells.flat();
  const low = Math.min(...all);
  const high = Math.max(...all);
  const grid = el("div", { class: "week" }, el("span"), ...DAYS.map((day) => el("span", { class: "head" }, day)));
  cells.forEach((row, hour) => {
    grid.append(el("span", { class: "hour" }, HOURS[hour] ?? ""));
    for (const value of row) {
      const heat = high > low ? (value - low) / (high - low) : 0;
      grid.append(el("span", { class: "cell", style: `--heat:${(0.1 + heat * 0.9).toFixed(2)}` }, String(Math.round(value))));
    }
  });
  return el("div", {}, el("h4", {}, title), grid);
}

/** A week to paint meetings on, four dials, and what a developer gets done in it. */
export function mountDeveloperMeetings(host: HTMLElement): void {
  const parameters = { focus: 25, fatigue: 15, featureSize: 300, weeks: 8 };
  const meetingTypes: Record<string, MeetingType> = {
    "🍽️ Lunch": { focus: -100, fatigue: -100 },
    "🏃 Sprint plan": { focus: -100, fatigue: 50 },
    "😴 Boring": { focus: -50, fatigue: -25 },
  };
  const calendar: Record<string, string> = {};
  for (let day = 0; day < DAYS_PER_WEEK; day += 1) calendar[`${day}-3`] = "🍽️ Lunch";

  let painting = "🏃 Sprint plan";
  let baseline: { summary: MeetingsSummary; weeks: number } | null = null;

  const figures = el("div", { class: "figures" });
  const weekly = el("div", { class: "chart" });
  const maps = el("div", { class: "maps" });
  const week = el("div", { class: "week" });
  const typeSelect = el("select");
  const focusInput = el("input", { type: "number", min: -100, max: 100 });
  const fatigueInput = el("input", { type: "number", min: -100, max: 100 });
  const newName = el("input", { type: "text", placeholder: "New meeting name", size: 16 });

  const dial = (key: keyof typeof parameters, label: string, min: number, max: number, from = (v: number) => v, to = (v: number) => v) => {
    const output = el("output", {}, String(parameters[key]));
    const input = el("input", {
      type: "range",
      min,
      max,
      value: to(parameters[key]),
      oninput: () => {
        parameters[key] = from(Number(input.value));
        output.textContent = String(parameters[key]);
        redraw();
      },
    });
    return el("label", {}, `${label}: `, output, input);
  };

  const dials = el(
    "div",
    { class: "dials" },
    dial("focus", "Focus an hour", 0, 100),
    dial("fatigue", "Fatigue an hour", 0, 100),
    dial("featureSize", "Feature size", 0, 1000, sliderToFeatureSize, featureSizeToSlider),
    dial("weeks", "Weeks", 1, 16),
  );

  function refreshTypes(): void {
    typeSelect.replaceChildren(
      ...Object.keys(meetingTypes).map((name) => el("option", { value: name, selected: name === painting }, name)),
    );
    const type = meetingTypes[painting];
    focusInput.value = String(type?.focus ?? 0);
    fatigueInput.value = String(type?.fatigue ?? 0);
  }

  typeSelect.addEventListener("change", () => {
    painting = typeSelect.value;
    refreshTypes();
  });
  const editType = () => {
    meetingTypes[painting] = { focus: Number(focusInput.value) || 0, fatigue: Number(fatigueInput.value) || 0 };
    redraw();
  };
  focusInput.addEventListener("change", editType);
  fatigueInput.addEventListener("change", editType);

  const addType = () => {
    const name = newName.value.trim();
    if (!name || meetingTypes[name]) return;
    meetingTypes[name] = { focus: 0, fatigue: 0 };
    painting = name;
    newName.value = "";
    refreshTypes();
  };

  const typeRow = el(
    "div",
    { class: "row" },
    el("span", {}, "Paint: "),
    typeSelect,
    el("span", {}, "focus "),
    focusInput,
    el("span", {}, "fatigue "),
    fatigueInput,
    newName,
    el("button", { type: "button", onclick: addType }, "Add"),
  );

  // Painting: press on an empty slot to add the chosen meeting and drag to add more;
  // press on a meeting to remove it and drag to remove more.
  let drag: "add" | "remove" | null = null;
  const paint = (key: string) => {
    if (drag === "add" && !calendar[key]) calendar[key] = painting;
    else if (drag === "remove" && calendar[key]) delete calendar[key];
    else return;
    redraw();
  };

  function drawWeek(): void {
    week.replaceChildren(el("span"), ...DAYS.map((day) => el("span", { class: "head" }, day)));
    HOURS.forEach((label, hour) => {
      week.append(el("span", { class: "hour" }, label));
      for (let day = 0; day < DAYS_PER_WEEK; day += 1) {
        const key = `${day}-${hour}`;
        const meeting = calendar[key];
        week.append(
          el(
            "span",
            {
              class: meeting ? "slot meeting" : "slot",
              title: meeting ?? "free",
              onpointerdown: (event) => {
                event.preventDefault();
                drag = calendar[key] ? "remove" : "add";
                paint(key);
              },
              onpointerenter: () => {
                if (drag) paint(key);
              },
            },
            meeting ? meeting.slice(0, 2) : "",
          ),
        );
      }
    });
  }
  window.addEventListener("pointerup", () => {
    drag = null;
  });

  const compare = el("div", { class: "row" });
  const saveBaseline = () => {
    baseline = { summary: summariseMeetings(simulateMeetings({ ...parameters, calendar, meetingTypes }), parameters), weeks: parameters.weeks };
    redraw();
  };
  const clearBaseline = () => {
    baseline = null;
    redraw();
  };

  function redraw(): void {
    drawWeek();
    const hours = simulateMeetings({ ...parameters, calendar, meetingTypes });
    const summary = summariseMeetings(hours, parameters);
    const totalHours = parameters.weeks * DAYS_PER_WEEK * HOURS_PER_DAY;

    figures.replaceChildren(
      el("div", { class: "clean" }, el("strong", {}, summary.totalFeatures.toFixed(1)), "features finished"),
      el("div", {}, el("strong", {}, summary.averageFeaturesPerWeek.toFixed(2)), "features a week"),
      el("div", {}, el("strong", {}, Math.round(summary.totalProductivity / totalHours).toString()), "productivity an hour"),
      el("div", {}, el("strong", {}, String(totalHours)), "hours simulated"),
    );

    compare.replaceChildren(
      baseline
        ? el(
            "span",
            {},
            `Baseline: ${baseline.summary.averageFeaturesPerWeek.toFixed(2)} features a week over ${baseline.weeks} weeks; now ${summary.averageFeaturesPerWeek.toFixed(2)}. `,
          )
        : el("span", {}, "Keep this run to compare against: "),
      el("button", { type: "button", onclick: saveBaseline }, baseline ? "Save again" : "Save as baseline"),
    );
    if (baseline) compare.append(el("button", { type: "button", onclick: clearBaseline }, "Clear"));

    weekly.innerHTML = barChart(
      [
        { name: "Productivity", className: "clean", values: summary.days.map((day) => day.productivity / parameters.weeks) },
        { name: "Features ×100", className: "debt", values: summary.days.map((day) => (day.features / parameters.weeks) * 100) },
      ],
      { x: "", y: "A day, on average" },
      DAYS,
    );
    weekly.prepend(el("h4", {}, "The shape of a week"));

    maps.replaceChildren(
      heatGrid("Focus", summary.hours.focus),
      heatGrid("Fatigue", summary.hours.fatigue),
      heatGrid("Productivity", summary.hours.productivity),
      heatGrid("Features finished", summary.hours.features),
    );
  }

  refreshTypes();
  host.append(dials, typeRow, el("div", { class: "charts" }, week, weekly), figures, compare, maps);
  redraw();
}
