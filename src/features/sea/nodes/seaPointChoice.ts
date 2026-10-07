import type { Editor } from "../../../platform/blueprint/NodeKind";
import { seaPoints } from "../seaPoints";

/** Which stretch of sea a node reads: one of them by its name, or every one, side by side. */
export const seaPointChoice: Editor = {
  kind: "choice",
  choices: [...seaPoints.map((point) => ({ value: point.code, label: point.name })), { value: "all", label: "every point" }],
};
