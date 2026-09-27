import { describe, expect, it } from "vitest";
import { readSlides } from "../../platform/markdown/slides/readSlides";
import { KATA_STEPS } from "./KATA_STEPS";
import { kataFiveStepsSlides } from "./kataFiveStepsSlides";
import { renderKataFiveSteps } from "./renderKataFiveSteps";

describe("the five steps of the refactor, as slides", () => {
  const slides = readSlides(kataFiveStepsSlides());

  it("is the game as it stands at each commit from 18 to 23, each one green and named by its step", () => {
    expect(slides.map((slide) => slide.text)).toEqual([18, 19, 20, 21, 22, 23].map((commit) => KATA_STEPS[commit]?.code));
    expect(slides.every((slide) => slide.status?.kind === "green")).toBe(true);
    expect(slides[1]?.status?.text).toBe("commit 19 · Step 1 · Add the new beside the old — all tests pass.");
  });

  it("is drawn as slides of code, ready to be played", () => {
    expect(renderKataFiveSteps()).toMatch(/^<figure class="slides" data-language="js">/);
  });
});
