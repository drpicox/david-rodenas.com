import type { ModelContext } from "./ModelContext";

/** The browser's model context, wherever this draft of WebMCP keeps it, or nothing: most browsers have none yet. */
export function modelContextHere(): ModelContext | undefined {
  const where = [document, navigator] as unknown as { modelContext?: ModelContext }[];
  return where.map((place) => place.modelContext).find((context) => typeof context?.registerTool === "function");
}
