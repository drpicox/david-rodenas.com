const KEY = "shell-pending";

/**
 * What the shell had still to do when a `cd` needed a real navigation: the
 * rest of the line, carried in this tab to the next page, which takes it once.
 */
export const carriedLine = {
  carry(pending: string): void {
    try {
      if (pending) sessionStorage.setItem(KEY, pending);
    } catch {
      // The next page simply starts clean.
    }
  },

  take(): string {
    try {
      const value = sessionStorage.getItem(KEY) ?? "";
      sessionStorage.removeItem(KEY);
      return value;
    } catch {
      return "";
    }
  },
};
