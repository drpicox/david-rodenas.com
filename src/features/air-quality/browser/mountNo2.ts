import { el } from "../../../platform/browser/el";
import { sourceLineOf } from "../../../platform/browser/sourceLineOf";
import type { No2Selection } from "../No2Selection";
import type { No2Station } from "../No2Station";
import { no2Stations } from "../no2Stations";
import { renderNo2Figure } from "../renderNo2Figure";
import { wholeRecord } from "../wholeRecord";

const DAYS: readonly (readonly [No2Selection["days"], string])[] = [
  ["all", "every day"],
  ["workdays", "Monday to Friday"],
  ["weekends", "Saturday and Sunday"],
];

/**
 * The figure the build already wrote, with the choices put above it: which
 * station, which days, which years. A station's file is fetched when it is
 * first chosen and kept; everything else is arithmetic on what is held.
 */
export function mountNo2(host: HTMLElement): () => void {
  const held = new Map<string, Promise<No2Station>>();
  const source = sourceLineOf(host, "/data/no2/index.json");
  const figure = el("div");
  figure.append(...host.querySelectorAll("figure"));

  let station: No2Station | null = null;
  let selection: No2Selection = { from: 0, to: 9999, days: "all" };
  let stopped = false;

  const option = (value: string | number, label: string = String(value)) => el("option", { value }, label);
  const stationSelect = el("select", { onchange: () => void choose(stationSelect.value) }, ...no2Stations.map(({ code, name }) => option(code, name)));
  const daysSelect = el("select", { onchange: () => change({ days: daysSelect.value as No2Selection["days"] }) }, ...DAYS.map(([value, label]) => option(value, label)));
  const fromSelect = el("select", { onchange: () => change({ from: Number(fromSelect.value), to: Math.max(Number(fromSelect.value), selection.to) }) });
  const toSelect = el("select", { onchange: () => change({ to: Number(toSelect.value), from: Math.min(Number(toSelect.value), selection.from) }) });
  const everyYear = el("button", { type: "button", onclick: () => station && change(wholeRecord(station)) }, "every year");

  function draw(): void {
    if (!station) return;
    figure.innerHTML = renderNo2Figure(station, selection);
    fromSelect.value = String(selection.from);
    toSelect.value = String(selection.to);
    daysSelect.value = selection.days;
  }

  function change(next: Partial<No2Selection>): void {
    selection = { ...selection, ...next };
    draw();
  }

  async function choose(code: string): Promise<void> {
    const asked = held.get(code) ?? fetch(`/data/no2/${code}.json`).then((response) => response.json() as Promise<No2Station>);
    held.set(code, asked);
    try {
      const arrived = await asked;
      if (stopped || stationSelect.value !== code) return;
      // Years the reader chose are kept across stations, to compare the same years in two places; a
      // station that has none of them, or a reader who had chosen none, gets the whole record.
      const whole = wholeRecord(arrived);
      const chosen = station !== null && (selection.from !== wholeRecord(station).from || selection.to !== wholeRecord(station).to);
      // Snapped to years this station has: a record can have a hole in it, and the lists only offer what is held.
      const within = Object.keys(arrived.years).map(Number).filter((year) => year >= selection.from && year <= selection.to);
      const kept = chosen && within.length > 0 ? { from: Math.min(...within), to: Math.max(...within) } : whole;
      station = arrived;
      selection = { ...kept, days: selection.days };
      const years = Object.keys(arrived.years);
      fromSelect.replaceChildren(...years.map((year) => option(year)));
      toSelect.replaceChildren(...years.map((year) => option(year)));
      draw();
    } catch {
      held.delete(code);
      figure.replaceChildren(el("p", {}, "The measurements for this station did not arrive. The rest of the page does not depend on them."));
    }
  }

  // A bar is a year: pressing one looks at that year alone.
  figure.addEventListener("click", (event) => {
    const year = (event.target as Element | null)?.closest("[data-year]")?.getAttribute("data-year");
    if (year) change({ from: Number(year), to: Number(year) });
  });

  const controls = el(
    "div",
    { class: "row" },
    el("label", {}, "Station ", stationSelect),
    el("label", {}, "Days ", daysSelect),
    el("label", {}, "Years ", fromSelect, " to ", toSelect),
    everyYear,
  );
  host.replaceChildren(controls, figure, source);
  void choose(stationSelect.value);

  return () => {
    stopped = true;
  };
}
