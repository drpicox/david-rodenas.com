/** Where a reader's own version of a page's blueprints is kept: their browser, and nowhere else. */
const PREFIX = "blueprint:";

/**
 * A reader's changes to the blueprints of a page, kept in their browser so
 * that coming back finds them as they were left. Storage can be refused — a
 * private window, a blocked site — and then nothing is kept, and nothing
 * breaks.
 */
export class KeptBlueprints {
  constructor(private readonly storage: () => Storage | null) {}

  get(key: string): string | null {
    try {
      return this.storage()?.getItem(PREFIX + key) ?? null;
    } catch {
      return null;
    }
  }

  set(key: string, text: string): void {
    try {
      this.storage()?.setItem(PREFIX + key, text);
    } catch {
      // A browser that keeps nothing keeps nothing: the blueprint still works.
    }
  }

  forget(key: string): void {
    try {
      this.storage()?.removeItem(PREFIX + key);
    } catch {
      // Nothing kept, nothing to forget.
    }
  }
}
