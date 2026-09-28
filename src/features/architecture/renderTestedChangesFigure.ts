import { percent } from "./percent";
import type { TestedChanges } from "./testedChangesOf";

/** The mark test-driven work leaves, as the one number it is, and what it is out of. */
export function renderTestedChangesFigure({ tested, withTest, untested }: TestedChanges): string {
  return (
    `<figure class="changes-figure tested"><p class="figure-number"><strong>${percent(withTest, tested)}</strong> of the changes to a file a test imports came with its test</p>` +
    `<figcaption>${withTest} of the ${tested} changes to a file a test imports came with a change to that test, or a new one, in the same commit. ` +
    `Another ${untested} changes went to files with something to run that no test imports.</figcaption></figure>`
  );
}
