import type { Site } from "../content/Site";
import { CommandHistory } from "../shell/CommandHistory";
import { editLine } from "../shell/editLine";
import type { Outcome } from "../shell/Outcome";
import { parseCommandLine } from "../shell/parseCommandLine";
import type { Command } from "../shell/Command";
import { Shell } from "../shell/Shell";
import { el } from "./el";
import { followCaret } from "./followCaret";

export interface Terminal {
  /** Runs a line as if it had been typed, echo and all. */
  run(line: string): void;
  /** The page moved by itself; the prompt follows. */
  moveTo(route: string): void;
}

export interface TerminalOptions {
  /** Moves the page without leaving it; false when only a real navigation will do. */
  readonly navigate?: (route: string) => boolean;
  /** The site's own commands and whatever the features brought. */
  readonly commands?: readonly Command[];
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
  const line = form?.querySelector<HTMLElement>(".line");
  const ps1 = form?.querySelector<HTMLElement>(".ps1");
  if (!section || !screen || !form || !input || !line || !ps1) return null;

  const shell = new Shell(site, route, options.commands);
  const history = new CommandHistory();
  const syncCursor = followCaret(input, line);
  let hint: HTMLElement | null = null;

  // The newest line is the one to read, so the screen keeps its end in view, as a terminal does.
  const print = (node: HTMLElement) => {
    screen.append(node);
    screen.scrollTop = screen.scrollHeight;
  };

  const clearHint = () => {
    hint?.remove();
    hint = null;
  };

  const perform = (outcome: Outcome) => {
    if (outcome.clear) screen.replaceChildren();
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
    const typed = input.value.trim();
    input.value = "";
    syncCursor();
    if (!typed) return;
    history.add(typed);
    run(typed);
  });

  // The last kill, waiting to be put back somewhere else.
  let killed = "";

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
    } else if (event.ctrlKey && !event.metaKey && !event.altKey) {
      const edited = editLine(event.key, input.value, input.selectionStart ?? input.value.length, killed);
      if (!edited) return;
      event.preventDefault();
      clearHint();
      input.value = edited.line;
      input.setSelectionRange(edited.caret, edited.caret);
      killed = edited.killed;
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
    syncCursor();
  }

  const moveTo = (to: string) => {
    if (shell.moveTo(to)) ps1.textContent = shell.prompt;
  };

  return { run, moveTo };
}
