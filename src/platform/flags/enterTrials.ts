import type { Flag } from "./Flag";
import type { FlagStore } from "./FlagStore";

/**
 * Enters a reader in every trial they are not out of: a flag with a `trial`
 * share is drawn for them once — on if the lot falls under the share — and
 * kept, so they see the same site on every visit. A reader who has chosen a
 * flag for themselves is not in its trial. Returns the trials they are in.
 */
export function enterTrials(flags: readonly Flag[], store: FlagStore, random: () => number): { name: string; on: boolean }[] {
  return flags.flatMap((flag) => {
    if (flag.trial === undefined || flag.choices || store.chosen(flag.name)) return [];
    let on = store.drawn(flag.name);
    if (on === undefined) {
      on = random() < flag.trial;
      store.draw(flag.name, on);
    }
    return [{ name: flag.name, on }];
  });
}
