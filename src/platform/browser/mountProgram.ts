import type { App } from "../plugin/Feature";
import type { ChoiceParameter } from "../program/ChoiceParameter";
import { commandLineOf } from "../program/commandLineOf";
import { initialValues } from "../program/initialValues";
import type { NumberParameter } from "../program/NumberParameter";
import type { Program } from "../program/Program";
import { sliderOf } from "../program/sliderOf";
import type { Values } from "../program/Values";
import { el } from "./el";
import { PROGRAM_ASKED } from "./PROGRAM_ASKED";
import { PROGRAM_RAN } from "./PROGRAM_RAN";

interface Dial {
  readonly label: HTMLElement;
  /** Shows the value it has been handed, whoever changed it. */
  settle(value: number | string): void;
}

function slide(parameter: NumberParameter, moved: (value: number) => void): Dial {
  const slider = sliderOf(parameter);
  const show = parameter.show ?? String;
  const output = el("output");
  const input = el("input", { type: "range", name: parameter.name, min: slider.min, max: slider.max, step: slider.step });
  input.addEventListener("input", () => moved(slider.valueAt(Number(input.value))));
  return {
    label: el("label", {}, `${parameter.label}: `, output, input),
    settle: (value) => {
      input.value = String(slider.positionOf(Number(value)));
      output.textContent = show(Number(value));
    },
  };
}

function choose(parameter: ChoiceParameter, moved: (value: string) => void): Dial {
  const select = el("select", { name: parameter.name }, ...parameter.choices.map((choice) => el("option", { value: choice }, choice)));
  select.addEventListener("change", () => moved(select.value));
  return {
    label: el("label", {}, `${parameter.label} `, select),
    settle: (value) => {
      select.value = String(value);
    },
  };
}

/**
 * A program on its page: a dial for each parameter, and the program run again
 * whenever one moves. The dials know nothing of what they drive, and the line
 * under them is the command that would have asked the same. A place that
 * names its dials shows only those, and the program's glance.
 */
export function mountProgram(program: Program): App {
  return (host) => {
    let values: Values = initialValues(program);
    const shown = host.dataset["dials"]?.split(" ");
    const small = shown !== undefined && program.glance !== undefined;
    const line = el("code");
    const figure = el("div", { class: small ? "program-figure glance" : "program-figure" });

    const tell = (name: string) => (value: number | string) => {
      values = { ...values, [name]: value };
      draw();
    };
    const dials = program.parameters.filter((parameter) => !shown || shown.includes(parameter.name)).map((parameter) => ({
      name: parameter.name,
      dial: "choices" in parameter ? choose(parameter, tell(parameter.name)) : slide(parameter, tell(parameter.name)),
    }));

    function draw(): void {
      for (const { name, dial } of dials) dial.settle(values[name] ?? "");
      line.textContent = `$ ${commandLineOf(program, values)}`;
      figure.innerHTML = small ? (program.glance?.(values) ?? "") : program.run(values).html;
      host.dispatchEvent(new CustomEvent<Values>(PROGRAM_RAN, { detail: values }));
    }

    const asked = (event: Event) => {
      values = { ...values, ...(event as CustomEvent<Values>).detail };
      draw();
    };
    host.addEventListener(PROGRAM_ASKED, asked);
    host.replaceChildren(el("div", { class: "dials" }, ...dials.map(({ dial }) => dial.label)), el("p", { class: "program-line" }, line), figure);
    draw();
    return () => host.removeEventListener(PROGRAM_ASKED, asked);
  };
}
