import type { WorldRecipe } from "../WorldRecipe";

const KEY = "header-world";

/**
 * The world a reader chose for the header, kept in this browser until they
 * let it go. Without a choice the header grows a new one each visit.
 */
export const headerWorld = {
  saved(): WorldRecipe | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const recipe = JSON.parse(raw) as Partial<WorldRecipe>;
      const numbers = [recipe.seed, recipe.levels, recipe.roughness, recipe.share];
      return numbers.every((n) => typeof n === "number" && Number.isFinite(n)) ? (recipe as WorldRecipe) : null;
    } catch {
      return null;
    }
  },

  remember(recipe: WorldRecipe): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(recipe));
    } catch {
      // Without storage the header still takes it, until the page is left.
    }
  },

  forget(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Nothing was kept, then.
    }
  },
};
