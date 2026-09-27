import type { Feature } from "../../platform/plugin/Feature";
import { technicalDebtProgram } from "./technicalDebtProgram";

/** What shortcuts cost, compounded: a program, and so a page's dials, a command and a tool. */
export const technicalDebtFeature: Feature = {
  name: "technical-debt",
  programs: [technicalDebtProgram],
};
