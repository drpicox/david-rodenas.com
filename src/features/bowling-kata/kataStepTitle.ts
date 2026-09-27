import type { TestRun } from "../../platform/testing/TestRun";
import type { KataStep } from "./KataStep";

/** A commit in words, for whoever cannot see its colour: which it is, its move, and what the tests said. */
export function kataStepTitle(step: KataStep, run: TestRun): string {
  return `commit ${step.commit} · ${step.stage} · ${run.passed ? "All tests pass." : run.message}`;
}
