import type { Feature } from "../../platform/plugin/Feature";
import { BrowserLayout } from "./browser/BrowserLayout";
import { settleLayout } from "./browser/settleLayout";
import { portfolioCommand } from "./portfolioCommand";

const layout = new BrowserLayout();

/**
 * A trial: the lists that have pictures, laid out as cards the width of a
 * program, with the picture above the words. Off unless asked for — by
 * `portfolio`, or by `?portfolio=on` in a link — and the choice is kept.
 * The pictures are in the HTML either way; only the layout changes.
 */
export const portfolioFeature: Feature = {
  name: "portfolio",
  commands: [portfolioCommand(layout)],
  install: () => settleLayout(layout),
};
