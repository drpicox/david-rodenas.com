import type { Feature } from "../../platform/plugin/Feature";
import { LcarsConsole } from "./browser/LcarsConsole";

/**
 * A trial David asked for, as a side project: the blueprints as an LCARS
 * display would show them — the panels of Star Trek's starships — and not
 * the workbench set in an LCARS frame. So it is another bench, with its own
 * idea of what hands do: the display lays the blueprint out, and it is
 * worked on by pressing pads. Behind a flag (`flags lcars on`, or
 * `?lcars=on`), for whoever switches it on; the workbench stays what a page
 * opens for everyone else, and both read the same blueprints.
 */
export const lcarsFeature: Feature = {
  name: "lcars",
  flags: [{ name: "lcars", description: "the blueprints as a starship's display: modules on a grid and pads to press, nothing to drag" }],
  benches: { lcars: (setting) => new LcarsConsole(setting) },
};
