import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { seaDaysNode } from "./seaDaysNode";
import { seaMonthsNode } from "./seaMonthsNode";
import { seaPointsNode } from "./seaPointsNode";
import { seaYearsNode } from "./seaYearsNode";

/** What the sea brings a blueprint: its points month by month, year by year, and a year day by day beside its normal. */
export const seaNodes: readonly NodeKind[] = [seaMonthsNode, seaYearsNode, seaDaysNode, seaPointsNode];
