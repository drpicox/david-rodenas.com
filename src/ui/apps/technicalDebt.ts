import { simulateTechnicalDebt } from "../../core/simulators/simulateTechnicalDebt";
import { barChart } from "../charts/barChart";
import { lineChart } from "../charts/lineChart";
import { el } from "../dom";

interface Dial {
  readonly key: "baseTime" | "shortcutFactor" | "interestRate" | "timeHorizon";
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly show: (value: number) => string;
}

const DIALS: readonly Dial[] = [
  { key: "baseTime", label: "Base time", min: 1, max: 30, step: 1, show: (v) => `${v} days` },
  { key: "shortcutFactor", label: "Shortcuts", min: 0, max: 0.9, step: 0.05, show: (v) => `${Math.round(v * 100)}%` },
  { key: "interestRate", label: "Interest", min: 0, max: 1, step: 0.01, show: (v) => `${Math.round(v * 100)}%` },
  { key: "timeHorizon", label: "Timeline", min: 6, max: 60, step: 1, show: (v) => `${v} months` },
];

/** Two teams, four dials, two charts. The arithmetic lives in core; this only shows it. */
export function mountTechnicalDebt(host: HTMLElement): void {
  const parameters = { baseTime: 20, shortcutFactor: 0.25, interestRate: 0.1, timeHorizon: 24 };

  const figures = el("div", { class: "figures" });
  const cumulative = el("div", { class: "chart" });
  const monthly = el("div", { class: "chart" });
  const insight = el("p");

  const dials = el(
    "div",
    { class: "dials" },
    ...DIALS.map((dial) => {
      const output = el("output", {}, dial.show(parameters[dial.key]));
      const input = el("input", {
        type: "range",
        min: dial.min,
        max: dial.max,
        step: dial.step,
        value: parameters[dial.key],
        oninput: () => {
          parameters[dial.key] = Number(input.value);
          output.textContent = dial.show(parameters[dial.key]);
          redraw();
        },
      });
      return el("label", {}, `${dial.label}: `, output, input);
    }),
  );

  function redraw(): void {
    const { months, breakEvenMonth } = simulateTechnicalDebt(parameters);
    const last = months[months.length - 1];
    const clean = last?.cleanCumulative ?? 0;
    const debt = last?.debtCumulative ?? 0;
    const difference = clean > 0 ? ((clean - debt) / clean) * 100 : 0;
    const verdict = Math.abs(difference) < 0.1 ? "Even" : difference > 0 ? "Loss" : "Gain";
    const percent = Math.abs(difference) < 0.1 ? "≈0%" : `${Math.abs(difference).toFixed(1)}%`;

    figures.replaceChildren(
      el("div", { class: "clean" }, el("strong", {}, String(clean)), "clean features"),
      el("div", { class: "debt" }, el("strong", {}, String(debt)), "debt features"),
      el("div", {}, el("strong", {}, breakEvenMonth ? `month ${breakEvenMonth}` : "never"), "break-even"),
      el("div", {}, el("strong", {}, percent), `${verdict.toLowerCase()} on the shortcut road`),
    );

    cumulative.innerHTML = lineChart(
      [
        { name: "Clean", className: "clean", values: months.map((month) => month.cleanCumulative) },
        { name: "Debt-driven", className: "debt", values: months.map((month) => month.debtCumulative) },
      ],
      { x: "Months", y: "Features" },
    );
    cumulative.prepend(el("h4", {}, "Cumulative features"));

    monthly.innerHTML = barChart(
      [
        { name: "Clean", className: "clean", values: months.slice(1).map((month) => month.cleanMonthly) },
        { name: "Debt-driven", className: "debt", values: months.slice(1).map((month) => month.debtMonthly) },
      ],
      { x: "Months", y: "Features a month" },
    );
    monthly.prepend(el("h4", {}, "Monthly delivery rate"));

    insight.textContent =
      parameters.interestRate === 0
        ? "With no interest there is no compound slowdown, and the shortcut simply wins. That is the one case that does not happen to real code."
        : breakEvenMonth
          ? `${Math.round(parameters.shortcutFactor * 100)}% saved at first, ${Math.round(parameters.interestRate * 100)}% interest on every feature: clean development overtakes at month ${breakEvenMonth}, and by month ${parameters.timeHorizon} the shortcut road has delivered ${percent} less.`
          : `${Math.round(parameters.shortcutFactor * 100)}% saved at first, ${Math.round(parameters.interestRate * 100)}% interest on every feature: in ${parameters.timeHorizon} months the clean road has not yet caught up. Give it longer, or raise the interest.`;
  }

  host.append(dials, figures, el("div", { class: "charts" }, cumulative, monthly), insight);
  redraw();
}
