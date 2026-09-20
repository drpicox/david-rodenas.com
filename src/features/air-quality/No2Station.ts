/** Twelve months of twenty-four hours: what was measured, added up, and how many measurements that was. */
export interface HourlySums {
  readonly sums: readonly (readonly number[])[];
  readonly counts: readonly (readonly number[])[];
}

/** Monday to Friday apart from Saturday and Sunday, because traffic keeps a working week. */
export interface No2Year {
  readonly workdays: HourlySums;
  readonly weekends: HourlySums;
}

/**
 * One measuring point, as it is kept and as it is served: the sums and the
 * counts rather than the means, so that any set of years can be averaged
 * exactly, each hour weighing what it measured.
 */
export interface No2Station {
  readonly code: string;
  readonly name: string;
  /** What the network says it measures: traffic, or the background away from it. */
  readonly kind: "traffic" | "background";
  readonly area: "urban" | "suburban" | "rural";
  readonly years: Readonly<Record<string, No2Year>>;
}
