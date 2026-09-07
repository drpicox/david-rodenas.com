import type { Site } from "../core/content/Site";
import { CommandHistory } from "../core/shell/CommandHistory";
import type { Outcome } from "../core/shell/Outcome";
import { parseCommandLine } from "../core/shell/parseCommandLine";
import { Shell } from "../core/shell/Shell";
import { el } from "./dom";
import { applyTheme } from "./theme";

export interface Terminal {
  /** Runs a line as if it had been typed, echo and all. */
  run(line: string): void;
  /** The page moved by itself; the prompt follows. */
  moveTo(route: string): void;
}

export interface TerminalOptions {
  /** Moves the page without leaving it; false when only a real navigation will do. */
  readonly navigate?: (route: string) => boolean;
}

const SCREEN_KEY = "shell-screen";
const PENDING_KEY = "shell-pending";

/** What the shell had printed and had still to do, carried over a `cd` to the next page. */
function carry(screen: HTMLElement, pending: string): void {
  try {
    sessionStorage.setItem(SCREEN_KEY, screen.innerHTML);
    if (pending) sessionStorage.setItem(PENDING_KEY, pending);
  } catch {
    // The next page simply starts clean.
  }
}

function takeCarried(key: string): string {
  try {
    const value = sessionStorage.getItem(key) ?? "";
    sessionStorage.removeItem(key);
    return value;
  } catch {
    return "";
  }
}

/** Keys pressed before this script arrived: the lines they finished, and the one they were on. */
function replayTyped(): { finished: string[]; unfinished: string } | null {
  window.__stopTyped?.();
  const keys = window.__typed ?? [];
  window.__typed = [];
  if (keys.length === 0) return null;
  const finished: string[] = [];
  let line = "";
  for (const key of keys) {
    if (key === "Enter") {
      finished.push(line);
      line = "";
    } else if (key === "Backspace") line = line.slice(0, -1);
    else line += key;
  }
  return { finished, unfinished: line };
}

/**
 * Wires the prompt on the page to the shell. The shell decides; this prints,
 * and does the few things only a page can do: move, clear, change colour.
 */
export function mountTerminal(site: Site, route: string, options: TerminalOptions = {}): Terminal | null {
  const section = document.querySelector<HTMLElement>(".terminal");
  const screen = section?.querySelector<HTMLElement>(".screen");
  const form = section?.querySelector<HTMLFormElement>("form.prompt");
  const input = form?.querySelector<HTMLInputElement>("input");
  const ps1 = form?.querySelector<HTMLElement>(".ps1");
  if (!section || !screen || !form || !input || !ps1) return null;

  const shell = new Shell(site, route);
  const history = new CommandHistory();
  let hint: HTMLElement | null = null;

  const print = (node: HTMLElement) => {
    screen.append(node);
  };

  const clearHint = () => {
    hint?.remove();
    hint = null;
  };

  const perform = (outcome: Outcome) => {
    if (outcome.clear) screen.replaceChildren();
    if (outcome.theme) {
      // The shell cannot know which way a toggle went; the page can.
      const became = applyTheme(outcome.theme);
      print(el("pre", {}, `theme: ${became}`));
      return;
    }
    if (outcome.html) {
      const block = el("div", { class: outcome.text ? "listing-out" : "cat" });
      block.innerHTML = outcome.html;
      print(block);
    } else if (outcome.text) {
      print(el("pre", { class: outcome.error ? "error" : "" }, outcome.text));
    }
  };

  // One command at a time, so that a `cd` can hand the rest of the line to the next page.
  const run = (line: string) => {
    clearHint();
    print(el("p", { class: "echo" }, el("span", { class: "ps1" }, shell.prompt), ` ${line}`));
    const commands = parseCommandLine(line).map((words) => words.join(" "));
    for (let index = 0; index < commands.length; index += 1) {
      const [outcome] = shell.run(commands[index] ?? "");
      if (!outcome) continue;
      if (outcome.navigate) {
        if (options.navigate?.(outcome.navigate)) continue;
        carry(screen, commands.slice(index + 1).join(" && "));
        window.location.assign(outcome.navigate);
        return;
      }
      perform(outcome);
      if (outcome.error) break;
    }
    ps1.textContent = shell.prompt;
    input.scrollIntoView({ block: "nearest" });
  };

  const complete = () => {
    clearHint();
    if (input.value.trim() === "") {
      input.value = "help";
      return;
    }
    const options = shell.complete(input.value);
    if (options.length === 1) {
      input.value = options[0] ?? input.value;
    } else if (options.length > 1) {
      hint = el("p", { class: "hint" }, options.map((option) => option.split(" ").pop()).join("  "));
      print(hint);
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const line = input.value.trim();
    input.value = "";
    if (!line) return;
    history.add(line);
    run(line);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      complete();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      input.value = history.previous(input.value);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      input.value = history.next(input.value);
    } else {
      clearHint();
    }
  });

  // A listed README.md is a command to run here, not a page to leave for.
  screen.addEventListener("click", (event) => {
    const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[data-run]");
    if (!anchor?.dataset["run"]) return;
    event.preventDefault();
    run(anchor.dataset["run"]);
  });

  // Start typing anywhere and the letters land in the prompt, as in a terminal.
  window.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement | null;
    const typing = target?.matches("input, textarea, select, [contenteditable]") ?? false;
    const plain = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    if (typing || !plain) return;
    input.focus({ preventScroll: false });
  });

  section.hidden = false;

  // Pick up where the last page left off: its screen, the rest of its line, and what was typed since.
  const carried = takeCarried(SCREEN_KEY);
  if (carried) screen.innerHTML = carried;
  const pending = takeCarried(PENDING_KEY);
  if (pending) run(pending);
  const typed = replayTyped();
  if (typed) {
    for (const line of typed.finished) {
      if (line.trim()) {
        history.add(line.trim());
        run(line.trim());
      }
    }
    input.value = typed.unfinished;
    input.focus();
  }

  const moveTo = (to: string) => {
    if (shell.moveTo(to)) ps1.textContent = shell.prompt;
  };

  return { run, moveTo };
}
