export function focusShellPrompt() {
  const input = document.querySelector(
    "input[data-ref=prompt]",
  ) as HTMLInputElement;
  if (input) {
    input.focus();
    input.scrollIntoView({ behavior: "smooth" });
  }
}
