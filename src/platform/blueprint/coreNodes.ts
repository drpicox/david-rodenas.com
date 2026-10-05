import type { NodeKind } from "./NodeKind";
import { barsNode } from "./nodes/barsNode";
import { correlationNode } from "./nodes/correlationNode";
import { dialNode } from "./nodes/dialNode";
import { formulaNode } from "./nodes/formulaNode";
import { groupNode } from "./nodes/groupNode";
import { heatmapNode } from "./nodes/heatmapNode";
import { histogramNode } from "./nodes/histogramNode";
import { joinNode } from "./nodes/joinNode";
import { keepNode } from "./nodes/keepNode";
import { linesNode } from "./nodes/linesNode";
import { noteNode } from "./nodes/noteNode";
import { readoutNode } from "./nodes/readoutNode";
import { scatterNode } from "./nodes/scatterNode";
import { seasonNode } from "./nodes/seasonNode";
import { showTableNode } from "./nodes/showTableNode";
import { sortNode } from "./nodes/sortNode";
import { stackNode } from "./nodes/stackNode";
import { summaryNode } from "./nodes/summaryNode";
import { topNode } from "./nodes/topNode";
import { trendNode } from "./nodes/trendNode";
import { yourDataNode } from "./nodes/yourDataNode";

/**
 * The nodes every blueprint has, whatever the features bring: a dial, the
 * steps that work on any table, the statistics, the pictures, a note, and a
 * table of one's own. In the order the menu shows them, shelf by shelf.
 */
export const coreNodes: readonly NodeKind[] = [
  dialNode,
  yourDataNode,
  keepNode,
  sortNode,
  topNode,
  groupNode,
  joinNode,
  stackNode,
  formulaNode,
  seasonNode,
  summaryNode,
  correlationNode,
  trendNode,
  histogramNode,
  barsNode,
  linesNode,
  scatterNode,
  heatmapNode,
  showTableNode,
  readoutNode,
  noteNode,
];
