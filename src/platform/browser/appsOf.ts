import type { App, Feature } from "../plugin/Feature";
import { mountProgram } from "./mountProgram";

/**
 * Every program a page can make room for, by the name the markdown calls it:
 * the features' programs on plain dials, unless the feature brings an app of
 * its own by the same name, which is how a program gets a page around it.
 */
export function appsOf(features: readonly Feature[]): Record<string, App> {
  return Object.assign(
    {},
    ...features.flatMap((feature) => feature.programs ?? []).map((program) => ({ [program.name]: mountProgram(program) })),
    ...features.map((feature) => feature.apps ?? {}),
  );
}
