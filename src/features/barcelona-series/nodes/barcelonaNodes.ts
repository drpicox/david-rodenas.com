import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { barcelonaMonthsNode } from "./barcelonaMonthsNode";
import { barcelonaYearsNode } from "./barcelonaYearsNode";

/** What Barcelona's series brings a blueprint: its years since 1780, and its months. */
export const barcelonaNodes: readonly NodeKind[] = [barcelonaYearsNode, barcelonaMonthsNode];
