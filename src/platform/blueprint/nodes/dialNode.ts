import type { NodeKind } from "../NodeKind";

/**
 * A value turned by hand, standing on the board above the pictures. Wired
 * into an input, it takes that input's shape — a slider for a number, a list
 * for a choice, a box for yes or no — so one dial can drive every node that
 * should move together.
 */
export const dialNode: NodeKind = {
  name: "dial",
  title: "Dial",
  role: "dial",
  shelf: "Dials",
  summary: "A value to turn by hand, on the board above the pictures: wire it into any input that takes a number, some words, or yes and no.",
  inputs: [{ name: "value", label: "value", type: "value", initial: 0 }],
  outputs: [{ name: "value", label: "value", type: "value" }],
  run: ({ value }) => ({ outputs: { value } }),
};
