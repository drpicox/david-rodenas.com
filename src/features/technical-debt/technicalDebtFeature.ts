import type { Feature } from "../../platform/plugin/Feature";
import { mountTechnicalDebt } from "./browser/mountTechnicalDebt";

/** What shortcuts cost, compounded, with the dials on the outside. */
export const technicalDebtFeature: Feature = {
  name: "technical-debt",
  apps: { "technical-debt": mountTechnicalDebt },
};
