import type { Values } from "../program/Values";
import { PROGRAM_ASKED } from "./PROGRAM_ASKED";

/** Tells the program standing in a host to run with these values, the dials and all. */
export function askProgram(host: HTMLElement, values: Values): void {
  host.dispatchEvent(new CustomEvent<Values>(PROGRAM_ASKED, { detail: values }));
}
