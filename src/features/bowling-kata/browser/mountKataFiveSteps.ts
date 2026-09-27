import { renderKataFiveSteps } from "../renderKataFiveSteps";

/**
 * The slides are played by the page, as every ```slides block is; they are
 * drawn here too because a page reached by a link is rendered in the
 * browser, where no still was filled in.
 */
export function mountKataFiveSteps(host: HTMLElement): void {
  if (!host.querySelector("figure.slides")) host.innerHTML = renderKataFiveSteps();
}
