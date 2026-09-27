import { el } from "../../../platform/browser/el";
import { EXAMPLE_POST } from "../EXAMPLE_POST";
import { renderStepCode } from "../renderStepCode";

/** A post to write, one step a line, and the tests it becomes, written again as it is typed. */
export function mountStepNames(host: HTMLElement): void {
  const post = el("textarea", { class: "step-post", rows: 6, spellcheck: false, "aria-label": "A post, one step a line" });
  post.value = EXAMPLE_POST.map((line) => `* ${line}`).join("\n");
  const code = el("div");
  const draw = () => {
    code.innerHTML = renderStepCode(post.value.split("\n").map((line) => line.replace(/^\s*[*-]\s*/, "")));
  };
  post.addEventListener("input", draw);
  host.replaceChildren(post, code);
  draw();
}
