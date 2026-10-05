import type { Editor } from "../../../platform/blueprint/NodeKind";

/** Which days of the week are counted: all of them, Monday to Friday, or the weekend — traffic keeps a working week. */
export const no2DaysChoice: Editor = {
  kind: "choice",
  choices: [
    { value: "all", label: "every day" },
    { value: "workdays", label: "Monday to Friday" },
    { value: "weekends", label: "Saturday and Sunday" },
  ],
};
