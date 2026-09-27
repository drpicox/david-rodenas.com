import { askedInAddress } from "../askedInAddress";
import type { BrowserLayout } from "./BrowserLayout";

/** What the address asks for wins, and is kept; otherwise what was kept before. */
export function settleLayout(layout: BrowserLayout): void {
  const asked = askedInAddress(window.location.search);
  if (asked) layout.apply(asked);
  else layout.settle();
}
