import type { KataLesson } from "./KataLesson";
import { KATA_LESSONS } from "./KATA_LESSONS";

/** The lesson that speaks for a commit, if one does. */
export function kataLessonAt(commit: number): KataLesson | undefined {
  return KATA_LESSONS.find(({ commits: [first, last] }) => commit >= first && commit <= last);
}
