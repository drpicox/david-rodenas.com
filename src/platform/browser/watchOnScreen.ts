/**
 * Whether an element is on screen, kept up to date.
 *
 * A planet scrolled past is still a planet being rasterised, sixty times a
 * second, onto pixels nobody can see. Asking the browser what is in view costs
 * nothing — it knows already — and the answer starts as yes, so a browser
 * without an observer simply keeps painting, which is what it did before.
 */
export function watchOnScreen(element: Element): { onScreen: () => boolean; stop: () => void } {
  let onScreen = true;
  if (typeof IntersectionObserver !== "function") return { onScreen: () => onScreen, stop: () => {} };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) onScreen = entry.isIntersecting;
    },
    // A little early, so nothing is caught still while it is coming into view.
    { rootMargin: "100px" },
  );
  observer.observe(element);
  return { onScreen: () => onScreen, stop: () => observer.disconnect() };
}
