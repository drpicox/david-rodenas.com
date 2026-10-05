import { el } from "../../browser/el";
import type { Literal } from "../../blueprint/NodeKind";
import type { Resolved } from "../../blueprint/resolvedEditor";

/** A control for one value, and how to show it a value it did not set itself. */
export interface Control {
  readonly element: HTMLElement;
  show(value: Literal | undefined): void;
}

export interface ControlOptions {
  /** Small, inside a node; or as a dial on the board, a slider where there is a range. */
  readonly style: "inline" | "dial";
  /** May be left empty, for the node to choose: the choice is then offered as "auto", saying what was chosen. */
  readonly optional?: boolean;
  /** What the node chose, or would start with, where nothing is written. */
  readonly settled?: string;
  readonly label: string;
  /** Told every value set, and whether the hand that set it is done: a slider still being dragged is not. */
  changed(value: Literal | undefined, done: boolean): void;
}

/**
 * The control that sets one input, as its editor says: a list for a choice,
 * a box for yes or no, a field for words, and for a number a field — or, on
 * the board, a slider where its range is known, with the value said beside
 * it. Left empty, an input the node may choose for itself says what it chose.
 */
export function controlFor(editor: Resolved, value: Literal | undefined, options: ControlOptions): Control {
  const { changed, label } = options;
  if (editor.kind === "choice") {
    const auto = options.optional ? [el("option", { value: "" }, options.settled ? `auto: ${options.settled}` : "auto")] : [];
    const select = el("select", { "aria-label": label }, ...auto, ...editor.choices.map((choice) => el("option", { value: choice.value }, choice.label)));
    select.addEventListener("change", () => changed(select.value === "" ? undefined : select.value, true));
    const show = (shown: Literal | undefined) => {
      select.value = shown === undefined ? "" : String(shown);
    };
    show(value);
    return { element: select, show };
  }
  if (editor.kind === "flag") {
    const box = el("input", { type: "checkbox", "aria-label": label });
    box.addEventListener("change", () => changed(box.checked, true));
    const show = (shown: Literal | undefined) => {
      box.checked = shown === true;
    };
    show(value);
    return { element: box, show };
  }
  if (editor.kind === "number" && options.style === "dial" && editor.min !== undefined && editor.max !== undefined) {
    const [min, max] = [editor.min, editor.max];
    const slider = el("input", { type: "range", min, max, step: editor.step ?? "any", "aria-label": label });
    const said = el("output");
    const play = el("button", { type: "button", class: "wb-play", title: `Play ${label} from where it is to its end`, "aria-label": `Play ${label}` }, "▶");
    const say = (shown: number) => {
      said.textContent = editor.show ? editor.show(shown) : String(shown);
    };
    const set = (next: number, done: boolean) => {
      slider.value = String(next);
      say(next);
      changed(next, done);
    };
    let playing: ReturnType<typeof setInterval> | null = null;
    const stop = () => {
      if (playing !== null) clearInterval(playing);
      playing = null;
      play.textContent = "▶";
      play.setAttribute("aria-label", `Play ${label}`);
    };
    // Played from where it stands to its end, or from its start when it is at the end, in about ten seconds however long the range.
    play.addEventListener("click", () => {
      if (playing !== null) return stop();
      const step = editor.step ?? (max - min) / 100;
      const steps = Math.max(1, Math.round((max - min) / step));
      if (Number(slider.value) >= max) set(min, false);
      play.textContent = "❚❚";
      play.setAttribute("aria-label", `Pause ${label}`);
      playing = setInterval(() => {
        const next = Math.min(max, Number(slider.value) + step);
        if (!slider.isConnected || next >= max) {
          stop();
          if (slider.isConnected) set(max, true);
          return;
        }
        set(next, false);
      }, Math.min(600, Math.max(80, 10000 / steps)));
    });
    slider.addEventListener("input", () => {
      stop();
      set(Number(slider.value), false);
    });
    slider.addEventListener("change", () => changed(Number(slider.value), true));
    const show = (shown: Literal | undefined) => {
      if (shown === undefined || playing !== null) return;
      slider.value = String(shown);
      say(Number(shown));
    };
    show(value);
    return { element: el("span", { class: "wb-slider" }, play, slider, said), show };
  }
  if (editor.kind === "number") {
    const field = el("input", { type: "number", step: editor.step ?? "any", min: editor.min, max: editor.max, placeholder: options.settled ?? "", "aria-label": label });
    field.addEventListener("input", () => {
      if (field.value === "" || Number.isFinite(field.valueAsNumber)) changed(field.value === "" ? undefined : field.valueAsNumber, false);
    });
    field.addEventListener("change", () => changed(field.value === "" ? undefined : field.valueAsNumber, true));
    const show = (shown: Literal | undefined) => {
      if (field.ownerDocument.activeElement !== field) field.value = shown === undefined ? "" : String(shown);
    };
    show(value);
    return { element: field, show };
  }
  const lines = editor.kind === "text" ? (editor.lines ?? 1) : 1;
  const field = lines > 1 ? el("textarea", { rows: lines, spellcheck: false, "aria-label": label }) : el("input", { type: "text", spellcheck: false, placeholder: options.settled ?? "", "aria-label": label });
  field.addEventListener("input", () => changed(field.value === "" && options.optional ? undefined : field.value, false));
  field.addEventListener("change", () => changed(field.value === "" && options.optional ? undefined : field.value, true));
  const show = (shown: Literal | undefined) => {
    if (field.ownerDocument.activeElement !== field) field.value = shown === undefined ? "" : String(shown);
  };
  show(value);
  return { element: field, show };
}
