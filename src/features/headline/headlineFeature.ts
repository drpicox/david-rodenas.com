import type { Feature } from "../../platform/plugin/Feature";
import { mountHeadline } from "./browser/mountHeadline";
import { HEADLINES } from "./headlines";
import { nextHeadline } from "./nextHeadline";

let stop: (() => void) | null = null;

/**
 * The headline of the home page, and what it turns into. The home page opens
 * on what it has always said; after a while a cursor takes it back and types
 * one of the shorter things the page also says, chosen by lot, and the first
 * headline is one of the things it can come back to. Only at home: anywhere
 * else the heading is left alone.
 */
export const headlineFeature: Feature = {
  name: "headline",
  arrive: (page) => {
    stop?.();
    stop = null;
    if (page.route !== "/") return;
    stop = mountHeadline((current, original) => nextHeadline(current, [original, ...HEADLINES], Math.random()));
  },
};
