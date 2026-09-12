import type { Feature } from "../../platform/plugin/Feature";
import { mountHeadline } from "./browser/mountHeadline";
import type { Headline } from "./Headline";
import { headlineRounds } from "./headlineRounds";
import { HEADLINES } from "./headlines";

let stop: (() => void) | null = null;

/**
 * The headline of the home page, and what it turns into. The home page opens
 * on what it has always said; after a while a cursor takes it back and types
 * one of the shorter things the page also says, in rounds drawn by lot, and
 * the first headline takes its turn in each round like the others. Only at
 * home: anywhere else the heading is left alone.
 */
export const headlineFeature: Feature = {
  name: "headline",
  arrive: (page) => {
    stop?.();
    stop = null;
    if (page.route !== "/") return;
    let next: ((current: Headline) => Headline) | null = null;
    stop = mountHeadline((current, original) => {
      next ??= headlineRounds([original, ...HEADLINES], Math.random);
      return next(current);
    });
  },
};
