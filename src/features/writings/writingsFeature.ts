import type { Feature } from "../../platform/plugin/Feature";
import { writingsTool } from "./writingsTool";

/** What David has written and said, for an agent to ask about: read off the pages that list them. */
export const writingsFeature: Feature = {
  name: "writings",
  tools: [writingsTool],
};
