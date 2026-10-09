import type { Feature } from "../../platform/plugin/Feature";
import { installSearch } from "./browser/installSearch";
import { searchCommand } from "./searchCommand";
import { searchFlag } from "./searchFlag";

/** Finding a page by what it says: `search` at the prompt for everyone, and three ways of asking it, behind one flag, to choose between. */
export const searchFeature: Feature = {
  name: "search",
  flags: [searchFlag],
  commands: [searchCommand],
  install: installSearch,
};
