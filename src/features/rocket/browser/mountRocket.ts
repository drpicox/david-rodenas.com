import { el } from "../../../platform/browser/el";
import { firstShip } from "../firstShip";
import { renderVoyages } from "../renderVoyages";
import type { Ship } from "../Ship";

interface Dial {
  readonly key: "acceleration" | "fuel" | "exhaust";
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  /** The slider runs on a scale of its own where the quantity spans too many sizes to slide along. */
  readonly toSlider: (value: number) => number;
  readonly fromSlider: (position: number) => number;
  readonly show: (value: number) => string;
}

const same = (value: number) => value;
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumSignificantDigits: 2 });
const DIALS: readonly Dial[] = [
  { key: "acceleration", label: "Acceleration", min: 0.05, max: 3, step: 0.05, toSlider: same, fromSlider: same, show: (v) => `${v.toFixed(2)} g` },
  // From a tenth of the ship to what Andromeda takes, ten million million ships of fuel: only a logarithm slides that far.
  { key: "fuel", label: "Fuel", min: -1, max: 13, step: 0.05, toSlider: (v) => Math.log10(v / firstShip.dryMass), fromSlider: (p) => firstShip.dryMass * 10 ** p, show: (v) => `${compact.format(v / firstShip.dryMass)} × the ship` },
  { key: "exhaust", label: "Exhaust speed", min: 0.01, max: 1, step: 0.01, toSlider: same, fromSlider: same, show: (v) => `${Math.round(v * 100)}% of c` },
];

/** The table the build already wrote, with the ship's dials above it; a row is pressed to draw that trip. */
export function mountRocket(host: HTMLElement): void {
  let ship: Ship = firstShip;
  let chosen = "Proxima Centauri";
  const figure = el("div");

  const draw = () => {
    figure.innerHTML = renderVoyages(ship, chosen);
  };

  const dials = el(
    "div",
    { class: "dials" },
    ...DIALS.map((dial) => {
      const output = el("output", {}, dial.show(ship[dial.key]));
      const input = el("input", {
        type: "range",
        min: dial.min,
        max: dial.max,
        step: dial.step,
        value: dial.toSlider(ship[dial.key]),
        oninput: () => {
          ship = { ...ship, [dial.key]: dial.fromSlider(Number(input.value)) };
          output.textContent = dial.show(ship[dial.key]);
          draw();
        },
      });
      return el("label", {}, `${dial.label}: `, output, input);
    }),
  );

  figure.addEventListener("click", (event) => {
    const destination = (event.target as Element | null)?.closest("[data-destination]")?.getAttribute("data-destination");
    if (!destination) return;
    chosen = destination;
    draw();
  });

  host.replaceChildren(dials, figure);
  draw();
}
