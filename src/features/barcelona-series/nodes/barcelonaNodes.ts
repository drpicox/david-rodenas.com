import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { barcelonaMonthsNode } from "./barcelonaMonthsNode";
import { barcelonaRainNode } from "./barcelonaRainNode";
import { barcelonaYearsNode } from "./barcelonaYearsNode";

/** What Barcelona's series bring a blueprint: its temperature year by year since 1780, its rain since 1786, and both month by month. */
export const barcelonaNodes: readonly NodeKind[] = [barcelonaYearsNode, barcelonaRainNode, barcelonaMonthsNode];
