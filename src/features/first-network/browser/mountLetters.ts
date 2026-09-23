import { el } from "../../../platform/browser/el";
import { firstReader } from "../firstReader";
import { glyphs } from "../glyphs";
import { LetterReader } from "../LetterReader";
import { renderLetters } from "../renderLetters";

/**
 * The grid to draw on, the letters to start a drawing from, and the lessons:
 * which letters the network is taught, a hundred rounds more, or none at all.
 * The network answers on every press, because answering costs nothing; only
 * teaching takes rounds.
 */
export function mountLetters(host: HTMLElement): void {
  let reader = firstReader();
  let pixels = [...glyphs.A!];

  const figure = el("div", {
    onclick: (event: Event) => {
      const at = (event.target as HTMLElement).closest<HTMLElement>("[data-at]")?.dataset["at"];
      if (at === undefined) return;
      pixels[Number(at)] = 1 - pixels[Number(at)]!;
      draw();
    },
  });

  function draw(): void {
    figure.innerHTML = renderLetters(reader, pixels);
  }

  function drawn(next: number[]): void {
    pixels = next;
    draw();
  }

  const button = (label: string, onclick: () => void) => el("button", { type: "button", onclick }, label);
  const boxes = Object.keys(glyphs).map((letter) => el("input", { type: "checkbox", value: letter, checked: reader.letters.includes(letter), onchange: () => reteach() }));

  /** A new network for the letters ticked, taught as the page first was. */
  function reteach(): void {
    const ticked = boxes.filter((box) => box.checked);
    if (ticked.length < 2) {
      for (const box of boxes) box.checked = reader.letters.includes(box.value);
      return;
    }
    reader = firstReader(ticked.map((box) => box.value));
    draw();
  }

  const palette = el(
    "div",
    { class: "row" },
    "Draw ",
    ...Object.keys(glyphs).map((letter) => button(letter, () => drawn([...glyphs[letter]!]))),
    button("one cell wrong", () => {
      const at = Math.floor(Math.random() * pixels.length);
      drawn(pixels.map((pixel, i) => (i === at ? 1 - pixel : pixel)));
    }),
    button("clear", () => drawn(pixels.map(() => 0))),
  );
  const taught = el("div", { class: "row taught" }, "Taught: ", ...boxes.map((box) => el("label", {}, box, ` ${box.value}`)));
  const lessons = el(
    "div",
    { class: "row" },
    button("teach 100 more rounds", () => {
      reader.train(100);
      draw();
    }),
    button("forget everything", () => {
      reader = new LetterReader(reader.letters, 1);
      draw();
    }),
  );

  host.replaceChildren(palette, figure, taught, lessons);
  draw();
}
