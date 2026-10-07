import { el } from "../../browser/el";

/** What the hands do, said where the hands are: on a page full screen, the page's own words are out of sight. Returns how to close it. */
export function openHelp(host: HTMLElement): () => void {
  const line = (keys: string, what: string) => el("li", {}, el("strong", {}, keys), ` ${what}`);
  const close = el("button", { type: "button", class: "wb-help-close", "aria-label": "Close" }, "✕");
  const help = el(
    "div",
    { class: "wb-help", role: "dialog", "aria-label": "How to use it" },
    close,
    el(
      "ul",
      {},
      line("Choose a node", "and what could come next is offered under the canvas: a click adds it, wired and written."),
      line("Press an output's name", "to look at what it gives: a table's first rows, and what its columns are."),
      line("Drag from a pin", "to wire it: let go on another pin, or in empty space to choose what comes next."),
      line("Double-click, or the space bar,", "to add any node."),
      line("Drag a node by its title", "to move it, and the canvas to move about; Ctrl and the wheel zoom; F fits it all."),
      line("Shift and drag", "chooses several; Delete takes them away, Ctrl+D copies them, Ctrl+Z undoes."),
      line("Alt and a click on a pin", "lets go of its wires; so does dragging a wire off its input into empty space."),
      line("◉ beside a value", "puts it on the board as a dial; ▶ on a dial plays it."),
      line("Double-click a title", "to rename the node; a picture's title on the board finds its node."),
    ),
  );
  const shut = () => help.remove();
  close.addEventListener("click", shut);
  host.append(help);
  return shut;
}
