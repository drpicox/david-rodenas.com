/**
 * Utility functions for analytics tracking
 */

declare global {
  interface Window {
    goatcounter?: {
      count: (vars?: { path?: string; title?: string; referrer?: string; event?: boolean }) => void;
    };
  }
}

/**
 * Track a virtual page view with GoatCounter
 * @param path The new path being navigated to
 * @param title Optional title for the page
 */
export function trackVirtualPageView(path: string, title?: string): void {
  // Check if GoatCounter is available
  if (typeof window === "undefined" || !window.goatcounter?.count) {
    return;
  }

  // Track the virtual page view
  window.goatcounter.count({
    path,
    title: title || document.title,
  });
}