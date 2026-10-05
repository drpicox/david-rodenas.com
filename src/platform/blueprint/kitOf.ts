import type { NodeKind } from "./NodeKind";
import type { PinType } from "./PinType";

/** Every kind of node and every kind of wire a blueprint can name, found by name. */
export interface Kit {
  readonly kinds: ReadonlyMap<string, NodeKind>;
  readonly types: ReadonlyMap<string, PinType>;
}

function byName<T extends { readonly name: string }>(things: readonly T[], what: string): Map<string, T> {
  const found = new Map<string, T>();
  for (const thing of things) {
    if (found.has(thing.name)) throw new Error(`two ${what} are called ${thing.name}`);
    found.set(thing.name, thing);
  }
  return found;
}

/** The kinds the frame and the features bring, gathered once: a name a blueprint's text uses has to mean one thing. */
export function kitOf(kinds: readonly NodeKind[], types: readonly PinType[]): Kit {
  return { kinds: byName(kinds, "kinds of node"), types: byName(types, "kinds of wire") };
}
