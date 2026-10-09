import type { Prompt, Surroundings } from "../../../platform/plugin/Feature";
import { mountHeaderSearch } from "./mountHeaderSearch";
import { mountPaletteSearch } from "./mountPaletteSearch";
import { mountPromptSearch } from "./mountPromptSearch";

/**
 * The three ways of searching the site, all put on the page and each one
 * listening only while the flag is at its choice — the stylesheet shows its
 * parts under the same mark — so that switching the flag at the prompt
 * switches them at once, with nothing to reload.
 */
export function installSearch(_prompt: Prompt, { site }: Surroundings): () => void {
  const stops = [mountPromptSearch(), mountHeaderSearch(site), mountPaletteSearch(site)];
  return () => {
    for (const stop of stops) stop();
  };
}
