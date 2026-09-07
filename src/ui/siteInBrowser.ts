import { sources } from "virtual:site";
import { Site } from "../core/content/Site";

/** The same site the build rendered, rebuilt here from the same markdown. */
export const siteInBrowser = new Site(sources);
