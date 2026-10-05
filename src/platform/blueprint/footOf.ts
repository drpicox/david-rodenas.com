import type { NodeResult } from "./Evaluation";

/** The line at a node's foot: what came out, or why nothing did, in words. */
export function footOf(result: NodeResult | undefined, kind: string): { readonly said: string; readonly trouble: boolean } {
  if (!result) return { said: "", trouble: false };
  if (result.state === "done") return { said: result.said, trouble: false };
  if (result.state === "failed") return { said: result.message, trouble: true };
  if (result.state === "waiting") return { said: "fetching its data…", trouble: false };
  if (result.state === "blocked") return { said: `waits for ${result.by}`, trouble: false };
  if (result.state === "missing") return { said: `wire or write: ${result.pins.join(", ")}`, trouble: true };
  return { said: `there is no kind of node called ${kind}`, trouble: true };
}
