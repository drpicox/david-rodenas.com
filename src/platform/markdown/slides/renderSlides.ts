import { escapeHtml } from "../escapeHtml";
import { highlight } from "../highlight";
import { readSlides } from "./readSlides";

/**
 * A ```slides block as the page carries it: every frame is in the HTML, so
 * the words are there for whoever reads the source and whoever cannot run a
 * script; the last one, the one the slides end on, is the one shown. The
 * browser plays them from the first.
 */
export function renderSlides(body: string, language: string): string {
  const slides = readSlides(body);
  const frames = slides.map((slide, index) => {
    const said = slide.status ? `<p class="slide-status ${slide.status.kind}">${escapeHtml(slide.status.text)}</p>` : "";
    return `<div class="slide${index === slides.length - 1 ? " current" : ""}"><pre><code>${highlight(slide.text, language)}</code></pre>${said}</div>`;
  });
  return `<figure class="slides" data-language="${escapeHtml(language)}"><div class="slides-screen">${frames.join("")}</div></figure>`;
}
