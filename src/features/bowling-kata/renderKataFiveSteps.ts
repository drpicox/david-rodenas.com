import { renderSlides } from "../../platform/markdown/slides/renderSlides";
import { kataFiveStepsSlides } from "./kataFiveStepsSlides";

/** The five steps, drawn as slides the page plays like any other. */
export function renderKataFiveSteps(): string {
  return renderSlides(kataFiveStepsSlides(), "js");
}
