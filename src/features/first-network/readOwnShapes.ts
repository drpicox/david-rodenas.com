import type { Shape } from "./Shape";
import { shapeProblem } from "./shapeProblem";

const isCells = (pixels: unknown): pixels is number[] => Array.isArray(pixels) && pixels.length === 25 && pixels.every((pixel) => pixel === 0 || pixel === 1);

/**
 * The visitor's own letters, from the text the browser kept. Anything that
 * would not have been let in when it was drawn is left out, so an old or
 * hand-edited entry cannot break the grid: the rest are still there.
 */
export function readOwnShapes(text: string | null, taken: readonly string[] = []): Shape[] {
  let kept: unknown;
  try {
    kept = JSON.parse(text ?? "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(kept)) return [];
  const shapes: Shape[] = [];
  for (const entry of kept) {
    const { name, pixels } = (entry ?? {}) as { name?: unknown; pixels?: unknown };
    if (typeof name !== "string" || !isCells(pixels)) continue;
    if (shapeProblem(name, pixels, [...taken, ...shapes.map((shape) => shape.name)])) continue;
    shapes.push({ name: name.trim(), pixels });
  }
  return shapes;
}
