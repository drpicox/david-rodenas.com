import { blueprintStill } from "../blueprint/blueprintStill";
import { blueprintKitOf } from "./blueprintKitOf";
import { programStill } from "./programStill";
import type { Feature, Still } from "./Feature";

/**
 * Every still the features bring, one for each program that has none drawn
 * by hand, and the blueprint's, which runs whatever blueprint a page writes
 * with every kind of node the features bring. Runs in node, for the build.
 */
export function stillsOf(features: readonly Feature[]): Record<string, Still> {
  return Object.assign(
    { blueprint: blueprintStill(blueprintKitOf(features)) },
    ...features.flatMap((feature) => feature.programs ?? []).map((program) => ({ [program.name]: programStill(program) })),
    ...features.map((feature) => feature.stills ?? {}),
  );
}
