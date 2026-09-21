import { renderSourceLine, type SourceIndex } from "../../platform/data/renderSourceLine";
import type { Still } from "../../platform/plugin/Feature";
import type { NpmDownloads } from "./NpmDownloads";
import { renderPackages } from "./renderPackages";

/** There is nothing to choose on this one: the still is the whole figure. */
export const packagesStill: Still = (read) =>
  renderPackages(JSON.parse(read("/data/npm/downloads.json")) as NpmDownloads) + renderSourceLine(JSON.parse(read("/data/npm/index.json")) as SourceIndex);
