import { askProgram } from "../../../platform/browser/askProgram";
import { el } from "../../../platform/browser/el";
import { mountProgram } from "../../../platform/browser/mountProgram";
import { PROGRAM_RAN } from "../../../platform/browser/PROGRAM_RAN";
import type { App } from "../../../platform/plugin/Feature";
import { initialValues } from "../../../platform/program/initialValues";
import type { Values } from "../../../platform/program/Values";
import { rocketProgram } from "../rocketProgram";
import { shipOf } from "../shipOf";
import { mountStarMap } from "./mountStarMap";

/**
 * The rocket's program on its dials, with the map of the near stars above it.
 * The map is not part of the program: it hears what the program ran with, and
 * a star pressed on it, or a row of the table, asks the program for that trip.
 */
export const mountRocket: App = (host, surroundings) => {
  let values: Values = initialValues(rocketProgram);
  const ran = (event: Event) => {
    values = (event as CustomEvent<Values>).detail;
  };
  host.addEventListener(PROGRAM_RAN, ran);
  const stopProgram = mountProgram(rocketProgram)(host, surroundings);

  const chosen = (event: Event) => {
    const destination = (event.target as Element | null)?.closest("[data-destination]")?.getAttribute("data-destination");
    if (destination) askProgram(host, { to: destination });
  };
  host.addEventListener("click", chosen);

  const canvas = el("canvas", { class: "starmap", "aria-label": "The stars within twelve light-years of the Sun, turning, with the ship flying the chosen trip" });
  host.prepend(canvas);
  const stopMap = mountStarMap(canvas, () => ({ ship: shipOf(values), chosen: String(values["to"]) }), (name) => askProgram(host, { to: name }));

  return () => {
    stopMap();
    stopProgram?.();
    host.removeEventListener(PROGRAM_RAN, ran);
    host.removeEventListener("click", chosen);
  };
};
