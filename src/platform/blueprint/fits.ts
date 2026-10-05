import type { Kit } from "./kitOf";

/** Whether what flows out of one pin can go into another: the same type, or one the first can become. */
export function fits(kit: Kit, from: string, to: string): boolean {
  return from === to || kit.types.get(from)?.becomes?.[to] !== undefined;
}
