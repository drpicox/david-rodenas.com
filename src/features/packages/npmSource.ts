import type { YearlySource } from "../../platform/data/YearlySource";
import type { NpmDownloads } from "./NpmDownloads";
import { npmPackages } from "./npmPackages";

const FILE = "downloads.json";

/**
 * What the npm registry counted, a finished year at a time. The registry
 * answers for every package in one request; its counts start in 2015 and
 * include every mirror, robot and build server that ever ran an install —
 * they say a package is in use somewhere, not how many people use it.
 */
export const npmSource: YearlySource<NpmDownloads> = {
  name: "npm",
  directory: "public/data/npm",
  firstYear: 2015,
  files: [FILE],
  about: {
    measures: "downloads a year of the npm packages published as drpicox",
    attribution: "npm, Inc. Download counts of the public registry.",
    dataset: "https://github.com/npm/registry/blob/main/docs/download-counts.md",
    packages: npmPackages,
  },

  requestsFor(year) {
    return [`https://api.npmjs.org/downloads/point/${year}-01-01:${year}-12-31/${npmPackages.join(",")}`];
  },

  withYear(files, year, answers) {
    const answer = answers[0];
    const counted = Object.entries(typeof answer === "object" && answer !== null ? answer : {}).flatMap(([name, entry]) => {
      const downloads = (entry as { downloads?: unknown } | null)?.downloads;
      return npmPackages.includes(name) && typeof downloads === "number" && downloads > 0 ? [[name, downloads] as const] : [];
    });
    if (counted.length === 0) throw new Error("the registry did not answer with downloads");
    return { [FILE]: { years: { ...files[FILE]?.years, [year]: Object.fromEntries(counted) } } };
  },
};
