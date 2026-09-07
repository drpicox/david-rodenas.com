export interface Accent {
  readonly name: string;
  readonly light: string;
  readonly dark: string;
}

/**
 * A short list of considered colours, not a colour picker. Each one has to
 * carry links on white and on the dark ground without changing weight.
 */
export const ACCENTS: readonly Accent[] = [
  { name: "navy", light: "#1a4b9c", dark: "#7fa6ea" },
  { name: "pine", light: "#1c6b47", dark: "#5fb98a" },
  { name: "rust", light: "#a4451f", dark: "#e0906b" },
  { name: "plum", light: "#7b3785", dark: "#c08ad0" },
  { name: "ink", light: "#16181c", dark: "#ccd2da" },
];

const KEY = "accent";

function isDark(): boolean {
  const chosen = document.documentElement.dataset["theme"];
  if (chosen === "dark") return true;
  if (chosen === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyAccent(accent: Accent): void {
  document.documentElement.style.setProperty("--accent", isDark() ? accent.dark : accent.light);
}

export function savedAccent(): Accent {
  try {
    const name = localStorage.getItem(KEY);
    return ACCENTS.find((accent) => accent.name === name) ?? ACCENTS[0]!;
  } catch {
    return ACCENTS[0]!;
  }
}

export function rememberAccent(accent: Accent): void {
  try {
    localStorage.setItem(KEY, accent.name);
  } catch {
    // A reader who blocks storage still gets the colour, just not next time.
  }
}
