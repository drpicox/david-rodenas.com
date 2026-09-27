import { barChart } from "../../platform/charts/barChart";
import { lineChart } from "../../platform/charts/lineChart";
import type { Program } from "../../platform/program/Program";
import { simulateTechnicalDebt } from "./simulateTechnicalDebt";

/**
 * Two teams, four parameters, two charts. Percentages are said as percentages,
 * because that is how a reader types them and how an agent reads them; the
 * simulation is handed the fractions it has always counted in.
 */
export const technicalDebtProgram: Program = {
  name: "technical-debt",
  summary: "what shortcuts cost, compounded: two teams build the same features, one of them cutting corners",
  parameters: [
    { name: "base-time", label: "Base time", description: "days a feature takes when it is done properly", min: 1, max: 30, step: 1, initial: 20, show: (v) => `${v} days` },
    { name: "shortcuts", label: "Shortcuts", description: "percent of that time a shortcut saves, at first", min: 0, max: 90, step: 5, initial: 25, show: (v) => `${v}%` },
    { name: "interest", label: "Interest", description: "percent dearer every shortcut feature makes the next one", min: 0, max: 100, step: 1, initial: 10, show: (v) => `${v}%` },
    { name: "timeline", label: "Timeline", description: "months to look ahead", min: 6, max: 60, step: 1, initial: 24, show: (v) => `${v} months` },
  ],
  run(values) {
    const shortcuts = Number(values["shortcuts"]);
    const interest = Number(values["interest"]);
    const timeline = Number(values["timeline"]);
    const { months, breakEvenMonth } = simulateTechnicalDebt({
      baseTime: Number(values["base-time"]),
      shortcutFactor: shortcuts / 100,
      interestRate: interest / 100,
      timeHorizon: timeline,
    });
    const last = months[months.length - 1];
    const clean = last?.cleanCumulative ?? 0;
    const debt = last?.debtCumulative ?? 0;
    const difference = clean > 0 ? ((clean - debt) / clean) * 100 : 0;
    const even = Math.abs(difference) < 0.1;
    const verdict = even ? "even" : difference > 0 ? "loss" : "gain";
    const percent = even ? "≈0%" : `${Math.abs(difference).toFixed(1)}%`;
    const breakEven = breakEvenMonth ? `month ${breakEvenMonth}` : "never";

    const insight =
      interest === 0
        ? "With no interest there is no compound slowdown, and the shortcut simply wins. That is the one case that does not happen to real code."
        : breakEvenMonth
          ? `${shortcuts}% saved at first, ${interest}% interest on every feature: clean development overtakes at month ${breakEvenMonth}, and by month ${timeline} the shortcut road has delivered ${percent} less.`
          : `${shortcuts}% saved at first, ${interest}% interest on every feature: in ${timeline} months the clean road has not yet caught up. Give it longer, or raise the interest.`;

    const figures = [
      `<div class="clean"><strong>${clean}</strong>clean features</div>`,
      `<div class="debt"><strong>${debt}</strong>debt features</div>`,
      `<div><strong>${breakEven}</strong>break-even</div>`,
      `<div><strong>${percent}</strong>${verdict} on the shortcut road</div>`,
    ].join("");
    const cumulative = lineChart(
      [
        { name: "Clean", className: "clean", values: months.map((month) => month.cleanCumulative) },
        { name: "Debt-driven", className: "debt", values: months.map((month) => month.debtCumulative) },
      ],
      { x: "Months", y: "Features" },
    );
    const monthly = barChart(
      [
        { name: "Clean", className: "clean", values: months.slice(1).map((month) => month.cleanMonthly) },
        { name: "Debt-driven", className: "debt", values: months.slice(1).map((month) => month.debtMonthly) },
      ],
      { x: "Months", y: "Features a month" },
    );

    return {
      text: `clean ${clean} features, debt-driven ${debt}, break-even ${breakEven}\n${insight}`,
      html:
        `<div class="figures">${figures}</div>` +
        `<div class="charts"><div class="chart"><h4>Cumulative features</h4>${cumulative}</div><div class="chart"><h4>Monthly delivery rate</h4>${monthly}</div></div>` +
        `<p>${insight}</p>`,
      data: { cleanFeatures: clean, debtFeatures: debt, breakEvenMonth, months },
    };
  },
};
