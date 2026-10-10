import type { Feature } from "../../platform/plugin/Feature";
import { mountSearch } from "./browser/mountSearch";
import { searchCommand } from "./searchCommand";

/** Finding a page by what it says: `search` at the prompt, and the header that types it, with what it finds printed where `ls` printed the directories. */
export const searchFeature: Feature = {
  name: "search",
  commands: [searchCommand],
  install: (_prompt, { site }) => mountSearch(site),
};
