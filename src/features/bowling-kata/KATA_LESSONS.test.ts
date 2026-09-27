import { describe, expect, it } from "vitest";
import { KATA_LESSONS } from "./KATA_LESSONS";
import { KATA_STEPS } from "./KATA_STEPS";
import { kataLessonAt } from "./kataLessonAt";

describe("what my essays say about the kata, commit by commit", () => {
  it("tells the refactor of the representation as its five steps, one a commit, named before they start", () => {
    const titles = [18, 19, 20, 21, 22, 23].map((commit) => kataLessonAt(commit)?.title.split(" · ")[0]);
    expect(titles).toEqual(["Step 0", "Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]);
  });

  it("speaks only of commits the kata has, and of each commit once", () => {
    const claimed = KATA_LESSONS.flatMap(({ commits: [first, last] }) => Array.from({ length: last - first + 1 }, (_, index) => first + index));
    expect(new Set(claimed).size).toBe(claimed.length);
    expect(claimed.every((commit) => commit >= 0 && commit < KATA_STEPS.length)).toBe(true);
  });

  it("keeps every note short enough to read beside the code", () => {
    for (const lesson of KATA_LESSONS) expect(lesson.text.split(/\s+/).length, lesson.title).toBeLessThanOrEqual(35);
  });
});
