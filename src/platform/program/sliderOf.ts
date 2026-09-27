import type { NumberParameter } from "./NumberParameter";

export interface Slider {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  positionOf(value: number): number;
  valueAt(position: number): number;
}

/** The range input a quantity is slid along: its own scale, or its logarithm's. */
export function sliderOf(parameter: NumberParameter): Slider {
  if (parameter.scale !== "log") {
    return { min: parameter.min, max: parameter.max, step: parameter.step, positionOf: (value) => value, valueAt: (position) => position };
  }
  return {
    min: Math.log10(parameter.min),
    max: Math.log10(parameter.max),
    step: parameter.step,
    positionOf: (value) => Math.log10(value),
    valueAt: (position) => 10 ** position,
  };
}
