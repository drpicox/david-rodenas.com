import { el } from "../../browser/el";
import type { Kit } from "../../blueprint/kitOf";
import { parseBlueprint } from "../../blueprint/parseBlueprint";

/**
 * The blueprint as text, to read, to copy, or to write by hand: one node a
 * line, `name = kind input: value`, a value that names a node being a wire
 * from it. What cannot be read is said by its line as it is typed; applying
 * keeps every line that can be.
 */
export function openTextPanel(host: HTMLElement, text: string, kit: Kit, applied: (text: string) => void): () => void {
  const area = el("textarea", { class: "wb-text-area", spellcheck: false, "aria-label": "The blueprint as text", rows: 14 });
  area.value = text;
  const problems = el("ul", { class: "wb-problems", "aria-live": "polite" });
  const apply = el("button", { type: "button", class: "wb-apply" }, "Apply");
  const cancel = el("button", { type: "button" }, "Close");
  const copy = el("button", { type: "button" }, "Copy");
  const panel = el(
    "div",
    { class: "wb-text", role: "dialog", "aria-label": "The blueprint as text" },
    el("p", { class: "wb-text-help" }, "One node a line: ", el("code", {}, 'name = kind "Title" input: value'), ". A value that names another node, or name.output, is a wire from it; @ x y says where it stands."),
    area,
    problems,
    el("div", { class: "wb-text-buttons" }, apply, copy, cancel),
  );
  const check = () => {
    const read = parseBlueprint(area.value, kit);
    problems.replaceChildren(...read.problems.map((problem) => el("li", {}, `line ${problem.line}: ${problem.message}`)));
  };
  const close = () => panel.remove();
  area.addEventListener("input", check);
  area.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Escape") close();
  });
  apply.addEventListener("click", () => {
    close();
    applied(area.value);
  });
  cancel.addEventListener("click", close);
  copy.addEventListener("click", () => {
    void navigator.clipboard?.writeText(area.value).then(() => {
      copy.textContent = "Copied";
    });
  });
  host.append(panel);
  check();
  area.focus();
  return close;
}
