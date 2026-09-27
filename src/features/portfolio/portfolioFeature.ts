import type { Feature } from "../../platform/plugin/Feature";

/**
 * A trial: the lists that have pictures, laid out as cards the width of a
 * program, with the picture above the words. It is only a flag — `flags
 * portfolio on`, or `?portfolio=on` in a link — and a stylesheet rule under
 * `[data-flags~="portfolio"]`; the pictures are in the HTML either way.
 */
export const portfolioFeature: Feature = {
  name: "portfolio",
  flags: [{ name: "portfolio", description: "the lists with pictures as cards, the width of a program" }],
};
