import type { Flag } from "../../platform/flags/Flag";

/** Three ways of searching the site, to be tried against each other before one is kept: at the prompt, in the header, or in a palette. */
export const searchFlag: Flag = {
  name: "search",
  description: "three ways to search the site: at the prompt, in the header, or in a palette over the page",
  choices: ["prompt", "header", "palette"],
};
