/** A test, which fails and is put right, or a clean step, which changes nothing a test can see. */
export type SmallStep = "test" | "clean";

/**
 * The rhythm of small steps, never twice the same: a test, then up to three
 * clean steps, then the next test. The dice are handed in, so a run can be
 * drawn at build time and checked in a test.
 */
export function randomSteps(random: () => number, length: number): SmallStep[] {
  const steps: SmallStep[] = [];
  while (steps.length < length) {
    steps.push("test");
    const cleans = Math.floor(random() * 4);
    for (let count = 0; count < cleans && steps.length < length; count += 1) steps.push("clean");
  }
  return steps;
}
