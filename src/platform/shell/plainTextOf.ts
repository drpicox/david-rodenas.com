import type { Outcome } from "./Outcome";

const ENTITIES: Readonly<Record<string, string>> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };

/**
 * An outcome as words, for whoever reads it without a screen — an agent that
 * ran a line. A page printed by `cat` has only its markup; its words are what
 * is left once the tags are taken out, one block to a line.
 */
export function plainTextOf(outcome: Outcome): string {
  if (outcome.text) return outcome.text;
  if (!outcome.html) return "";
  return outcome.html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, "")
    .replace(/<\/(p|h[1-6]|li|tr|div|pre|dt|dd|figcaption|blockquote)>|<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name: string) => ENTITIES[name] ?? "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}
