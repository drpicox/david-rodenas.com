import { programStill } from "../program/programStill";
import type { Feature, Still } from "./Feature";

/** Every still the features bring, their programs' among them. Runs in node, for the build. */
export function stillsOf(features: readonly Feature[]): Record<string, Still> {
  return Object.assign(
    {},
    ...features.map((feature) => feature.stills ?? {}),
    ...features.flatMap((feature) => feature.programs ?? []).map((program) => ({ [program.name]: programStill(program) })),
  );
}
