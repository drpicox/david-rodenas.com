import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { no2HoursNode } from "./no2HoursNode";
import { no2MonthsNode } from "./no2MonthsNode";
import { no2StationsNode } from "./no2StationsNode";
import { no2YearsNode } from "./no2YearsNode";

/** What the air brings a blueprint: its measuring points, by month, by year, and by the hour of the day. */
export const airNodes: readonly NodeKind[] = [no2MonthsNode, no2YearsNode, no2HoursNode, no2StationsNode];
