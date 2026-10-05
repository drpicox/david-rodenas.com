import type { Literal, Painting } from "./NodeKind";

/** A node that ran: what it was handed, what it gave, and what it painted. */
export interface Done {
  readonly state: "done";
  readonly inputs: Readonly<Record<string, unknown>>;
  readonly outputs: Readonly<Record<string, unknown>>;
  readonly painting?: Painting;
  readonly settled: Readonly<Record<string, Literal>>;
  /** One line on what came out. */
  readonly said: string;
  /** What it ran on, to know whether it has to run again. */
  readonly key: readonly unknown[];
}

/** A node that could not do what it was asked, and why, in words. */
export interface Failed {
  readonly state: "failed";
  readonly inputs: Readonly<Record<string, unknown>>;
  readonly message: string;
  readonly key: readonly unknown[];
}

/**
 * Where each node of a blueprint stands after a run: done; failed, and why;
 * waiting for a file; held back by a node before it that did not answer;
 * missing an input it has to be given; or of a kind there is none of.
 */
export type NodeResult =
  | Done
  | Failed
  | { readonly state: "waiting"; readonly path: string }
  | { readonly state: "blocked"; readonly by: string }
  | { readonly state: "missing"; readonly pins: readonly string[] }
  | { readonly state: "unknown" };

/** Every node's result, by its id. */
export type Evaluation = ReadonlyMap<string, NodeResult>;
