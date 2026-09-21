/** The two desktops of the thesis: what each is, as the table of its evaluation chapter lists them. */
export const machines = {
  small: "Intel Atom 330, 2 cores, 8 W · NVIDIA 9400M, 16 cores, 10 W",
  large: "Intel i7 950, 4 cores, 130 W · NVIDIA GT 430, 96 cores, 49 W",
} as const;

export interface Run {
  readonly machine: keyof typeof machines;
  /** Which algorithm: matching every pair of graphs, or finding one labelling common to all of them. */
  readonly algorithm: "pairs" | "common-labelling";
  /** Vertices in each graph. */
  readonly vertices: number;
  /** How many graphs were matched. */
  readonly graphs: number;
  /** Seconds, the mean of the runs: one thread, OpenMP on the same processor, CUDA on the graphics chip beside it. */
  readonly serial: number;
  readonly openmp: number;
  readonly cuda: number;
}

/**
 * Measured in 2011 on the two desktops of the thesis, on graphs of the GREC
 * dataset: the largest set of each size that was run. From the thesis's own
 * results sheet, in the copy that holds the larger machine's runs — an older
 * copy has estimates in their place, exact multiples of the small machine's
 * times, and those are not these. The common labelling was only run on the
 * small machine.
 */
export const graphMatchingRuns: readonly Run[] = [
  { machine: "small", algorithm: "pairs", vertices: 8, graphs: 150, serial: 42.43, openmp: 14.34, cuda: 2.572 },
  { machine: "small", algorithm: "pairs", vertices: 16, graphs: 150, serial: 738.92, openmp: 247.95, cuda: 33.06 },
  { machine: "small", algorithm: "pairs", vertices: 24, graphs: 150, serial: 4387.13, openmp: 1208.97, cuda: 109.093 },
  { machine: "large", algorithm: "pairs", vertices: 8, graphs: 150, serial: 7.483, openmp: 1.511, cuda: 0.653 },
  { machine: "large", algorithm: "pairs", vertices: 16, graphs: 150, serial: 135.505, openmp: 25.061, cuda: 5.24 },
  { machine: "large", algorithm: "pairs", vertices: 24, graphs: 150, serial: 515.757, openmp: 126.228, cuda: 18.99 },
  { machine: "small", algorithm: "common-labelling", vertices: 8, graphs: 50, serial: 843.21, openmp: 214.51, cuda: 33.404 },
  { machine: "small", algorithm: "common-labelling", vertices: 16, graphs: 50, serial: 17061.4, openmp: 4284.01, cuda: 550.153 },
  { machine: "small", algorithm: "common-labelling", vertices: 24, graphs: 50, serial: 71670.13, openmp: 20274.32, cuda: 2332.076 },
];
