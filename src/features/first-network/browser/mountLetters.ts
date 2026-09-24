import { el } from "../../../platform/browser/el";
import { firstReader } from "../firstReader";
import { glyphs } from "../glyphs";
import { LetterReader } from "../LetterReader";
import { readOwnShapes } from "../readOwnShapes";
import { renderLetters } from "../renderLetters";
import type { Shape } from "../Shape";
import { shapeProblem } from "../shapeProblem";

const KEY = "first-network:own";
const BUILT_IN: readonly Shape[] = Object.entries(glyphs).map(([name, pixels]) => ({ name, pixels }));

/**
 * The grid to draw on, the letters to start a drawing from, and the lessons:
 * which letters the network is taught, a hundred rounds more, or none at all.
 * The visitor can add letters of their own, kept in their browser and taught
 * with the rest. The network answers on every press, because answering costs
 * nothing; only teaching takes rounds.
 */
export function mountLetters(host: HTMLElement): void {
  let own = load();
  const taught = new Set(["A", "B", ...own.map(({ name }) => name)]);
  const all = () => [...BUILT_IN, ...own];
  let reader = firstReader(taughtShapes());
  let pixels = [...glyphs.A!];

  const figure = el("div", {
    onclick: (event: Event) => {
      const at = (event.target as HTMLElement).closest<HTMLElement>("[data-at]")?.dataset["at"];
      if (at === undefined) return;
      pixels[Number(at)] = 1 - pixels[Number(at)]!;
      draw();
    },
  });
  const palette = el("div", { class: "row" });
  const boxes = el("div", { class: "row taught" });
  const name = el("input", { type: "text", maxlength: 3, size: 4, "aria-label": "a name for the drawing" });
  const problem = el("p", { class: "error", hidden: true });

  function draw(): void {
    figure.innerHTML = renderLetters(reader, pixels);
  }

  function drawn(next: number[]): void {
    pixels = next;
    draw();
  }

  function taughtShapes(): Shape[] {
    return all().filter((shape) => taught.has(shape.name));
  }

  /** A new network for the letters ticked, taught as the page first was. */
  function reteach(): void {
    reader = firstReader(taughtShapes());
    draw();
  }

  function load(): Shape[] {
    try {
      return readOwnShapes(localStorage.getItem(KEY), Object.keys(glyphs));
    } catch {
      return [];
    }
  }

  function save(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(own));
    } catch {
      // A browser that keeps nothing still teaches the letter for this visit.
    }
  }

  function remember(): void {
    const why = shapeProblem(name.value, pixels, all().map((shape) => shape.name));
    problem.textContent = why ?? "";
    problem.hidden = why === null;
    if (why) return;
    const shape = { name: name.value.trim(), pixels: [...pixels] };
    own = [...own, shape];
    taught.add(shape.name);
    name.value = "";
    save();
    controls();
    reteach();
  }

  function forget(forgotten: string): void {
    own = own.filter((shape) => shape.name !== forgotten);
    taught.delete(forgotten);
    // With one letter there is nothing to tell apart.
    for (const shape of BUILT_IN) if (taught.size < 2) taught.add(shape.name);
    save();
    controls();
    reteach();
  }

  const button = (label: string, onclick: () => void) => el("button", { type: "button", onclick }, label);

  /** The letters to draw from and the boxes of what is taught, both of which grow and shrink with the visitor's own. */
  function controls(): void {
    palette.replaceChildren(
      "Draw ",
      ...all().map((shape) => button(shape.name, () => drawn([...shape.pixels]))),
      button("one cell wrong", () => {
        const at = Math.floor(Math.random() * pixels.length);
        drawn(pixels.map((pixel, i) => (i === at ? 1 - pixel : pixel)));
      }),
      button("clear", () => drawn(pixels.map(() => 0))),
    );
    boxes.replaceChildren(
      "Taught: ",
      ...all().map((shape) => {
        const box = el("input", {
          type: "checkbox",
          value: shape.name,
          checked: taught.has(shape.name),
          onchange: () => {
            if (box.checked) taught.add(shape.name);
            else if (taught.size > 2) taught.delete(shape.name);
            else box.checked = true;
            reteach();
          },
        });
        const mine = own.includes(shape) && el("button", { type: "button", class: "forget", "aria-label": `forget ${shape.name}`, onclick: () => forget(shape.name) }, "×");
        return el("label", {}, box, ` ${shape.name}`, mine);
      }),
    );
  }

  const lessons = el(
    "div",
    { class: "row" },
    button("teach 100 more rounds", () => {
      reader.train(100);
      draw();
    }),
    button("forget everything", () => {
      reader = new LetterReader(reader.shapes, 1);
      draw();
    }),
  );
  const yours = el("div", { class: "row own" }, "Your own: draw it, name it ", name, button("remember this drawing", () => remember()), problem);

  controls();
  host.replaceChildren(palette, figure, boxes, lessons, yours);
  draw();
}
