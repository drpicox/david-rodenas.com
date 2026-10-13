import type { BenchMaker } from "./Bench";
import type { Feature } from "./Feature";

/**
 * The bench a blueprint in a page opens at, when it is not the frame's own:
 * the one a feature brings behind a flag that is on — the first installed,
 * where two are asked for at once. None, and the workbench stays.
 */
export function benchOf(features: readonly Feature[], isOn: (flag: string) => boolean): BenchMaker | undefined {
  return features.flatMap((feature) => Object.entries(feature.benches ?? {})).find(([flag]) => isOn(flag))?.[1];
}
