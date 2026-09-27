import { programStill } from "./programStill";
import type { Feature, Still } from "./Feature";

/** Every still the features bring, and one for each program that has none drawn by hand. Runs in node, for the build. */
export function stillsOf(features: readonly Feature[]): Record<string, Still> {
  return Object.assign(
    {},
    ...features.flatMap((feature) => feature.programs ?? []).map((program) => ({ [program.name]: programStill(program) })),
    ...features.map((feature) => feature.stills ?? {}),
  );
}
