import { programCommand } from "../program/programCommand";
import type { Command } from "../shell/Command";
import type { Feature } from "./Feature";

/** Every command the features bring, their programs' among them. */
export function commandsOf(features: readonly Feature[]): Command[] {
  return [...features.flatMap((feature) => feature.commands ?? []), ...features.flatMap((feature) => feature.programs ?? []).map(programCommand)];
}
