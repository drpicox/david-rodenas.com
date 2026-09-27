import { kataLessonAt } from "./kataLessonAt";
import { KATA_STEPS } from "./KATA_STEPS";

/** The refactor's commits, from the parts named to the old representation gone. */
const COMMITS = [18, 19, 20, 21, 22, 23];

/**
 * The five steps as a ```slides body: the game as it stands at each commit,
 * with the step my essay names it by, and the bar green every time — which
 * is the point of the technique.
 */
export function kataFiveStepsSlides(): string {
  return COMMITS.map((commit) => `${KATA_STEPS[commit]?.code ?? ""}\n--- green commit ${commit} · ${kataLessonAt(commit)?.title ?? ""} — all tests pass.`).join("\n");
}
