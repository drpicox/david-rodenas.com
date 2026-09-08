/**
 * The half-moon in the header. It is in the HTML from the start but inert and
 * hidden from a reader who is being read to, because without a script it does
 * nothing; this is what wakes it. It runs the command rather than calling the
 * theme, so that clicking it and typing `theme` are the same event, and the
 * screen says so either way.
 */
export function mountThemeToggle(run: () => void): () => void {
  const toggle = document.querySelector<HTMLButtonElement>(".theme-toggle");
  if (!toggle) return () => {};
  toggle.classList.add("ready");
  toggle.removeAttribute("aria-hidden");
  toggle.removeAttribute("tabindex");
  toggle.addEventListener("click", run);
  return () => toggle.removeEventListener("click", run);
}
