/** A ship as the simulator flies it. */
export interface Ship {
  /** Tonnes, without fuel. */
  readonly dryMass: number;
  /** Tonnes of fuel on board. */
  readonly fuel: number;
  /** The speed of what leaves the engine, as a share of the speed of light, 0 to 1. One is a perfect photon rocket. */
  readonly exhaust: number;
  /** What the crew feels while the engine burns, in g. */
  readonly acceleration: number;
}
