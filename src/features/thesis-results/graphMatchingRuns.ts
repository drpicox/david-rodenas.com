export interface Run {
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
 * Measured in 2011 on the low-power desktop of the thesis: an Intel Atom 330
 * (two cores, four threads, 8 W) with an NVIDIA 9400M beside it (16 cores,
 * 10 W). Graphs from the GREC dataset, the largest set of each size that was
 * run. From the thesis's own results sheet; the columns it holds for a faster
 * machine are estimates derived from these, and are not here.
 */
export const graphMatchingRuns: readonly Run[] = [
  { algorithm: "pairs", vertices: 8, graphs: 150, serial: 42.43, openmp: 14.34, cuda: 2.572 },
  { algorithm: "pairs", vertices: 16, graphs: 150, serial: 738.92, openmp: 247.95, cuda: 33.06 },
  { algorithm: "pairs", vertices: 24, graphs: 150, serial: 4387.13, openmp: 1208.97, cuda: 109.093 },
  { algorithm: "common-labelling", vertices: 8, graphs: 50, serial: 843.21, openmp: 214.51, cuda: 33.404 },
  { algorithm: "common-labelling", vertices: 16, graphs: 50, serial: 17061.4, openmp: 4284.01, cuda: 550.153 },
  { algorithm: "common-labelling", vertices: 24, graphs: 50, serial: 71670.13, openmp: 20274.32, cuda: 2332.076 },
];
