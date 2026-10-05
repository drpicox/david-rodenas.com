import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { weatherDaysNode } from "./weatherDaysNode";
import { weatherMonthsNode } from "./weatherMonthsNode";
import { weatherStationsNode } from "./weatherStationsNode";

/** What the weather brings a blueprint: its stations, month by month, and the days of a kind a year. */
export const weatherNodes: readonly NodeKind[] = [weatherMonthsNode, weatherDaysNode, weatherStationsNode];
