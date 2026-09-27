import type { App } from "../plugin/Feature";
import { commandLineOf } from "../program/commandLineOf";
import { initialValues } from "../program/initialValues";
import type { Program } from "../program/Program";
import { sliderOf } from "../program/sliderOf";
import type { Values } from "../program/Values";
import { el } from "./el";
import { PROGRAM_ASKED } from "./PROGRAM_ASKED";

/**
 * A program on its page: a dial for each parameter, and the program run again
 * whenever one moves. The dials know nothing of what they drive, and the line
 * under them is the command that would have asked the same.
 */
export function mountProgram(program: Program): App {
  return (host) => {
    let values: Values = initialValues(program);
    const line = el("code");
    const figure = el("div", { class: "program-figure" });

    const dials = program.parameters.map((parameter) => {
      const slider = sliderOf(parameter);
      const show = parameter.show ?? String;
      const output = el("output");
      const input = el("input", { type: "range", name: parameter.name, min: slider.min, max: slider.max, step: slider.step });
      input.addEventListener("input", () => {
        values = { ...values, [parameter.name]: slider.valueAt(Number(input.value)) };
        draw();
      });
      const settle = () => {
        const value = values[parameter.name] ?? parameter.initial;
        input.value = String(slider.positionOf(value));
        output.textContent = show(value);
      };
      return { label: el("label", {}, `${parameter.label}: `, output, input), settle };
    });

    function draw(): void {
      for (const dial of dials) dial.settle();
      line.textContent = `$ ${commandLineOf(program, values)}`;
      figure.innerHTML = program.run(values).html;
    }

    const asked = (event: Event) => {
      values = { ...values, ...(event as CustomEvent<Values>).detail };
      draw();
    };
    host.addEventListener(PROGRAM_ASKED, asked);
    host.replaceChildren(el("div", { class: "dials" }, ...dials.map((dial) => dial.label)), el("p", { class: "program-line" }, line), figure);
    draw();
    return () => host.removeEventListener(PROGRAM_ASKED, asked);
  };
}
