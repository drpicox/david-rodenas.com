import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { aroundNode } from "./aroundNode";
import { arrowsNode } from "./arrowsNode";
import { boxesNode } from "./boxesNode";
import { commitsNode } from "./commitsNode";
import { filesNode } from "./filesNode";
import { knotNode } from "./knotNode";
import { measureNode } from "./measureNode";
import { networkNode } from "./networkNode";
import { onlyFilesNode } from "./onlyFilesNode";
import { pictureNode } from "./pictureNode";
import { sourceNode } from "./sourceNode";

/** What this site's own source brings a blueprint: the graph at any commit, the history, the steps and measures of a graph, and its picture. */
export const architectureNodes: readonly NodeKind[] = [sourceNode, commitsNode, measureNode, onlyFilesNode, aroundNode, knotNode, boxesNode, filesNode, arrowsNode, networkNode, pictureNode];
