import { el } from "../../../platform/browser/el";
import { DISPATCHERS } from "../DISPATCHERS";
import { renderDispatcherRun } from "../renderDispatcherRun";

/** The same tests against each way of writing the dispatcher, chosen from a row of three. */
export function mountTestsAsExamples(host: HTMLElement): void {
  const shown = el("div");
  const choices = DISPATCHERS.map((dispatcher, index) => {
    const input = el("input", { type: "radio", name: "dispatcher", value: dispatcher.name, checked: index === 0 });
    input.addEventListener("change", () => {
      shown.innerHTML = renderDispatcherRun(dispatcher);
    });
    return el("label", {}, input, ` ${dispatcher.label}`);
  });
  host.replaceChildren(el("div", { class: "dispatcher-choice", role: "radiogroup", "aria-label": "The dispatcher" }, ...choices), shown);
  shown.innerHTML = renderDispatcherRun(DISPATCHERS[0]!);
}
