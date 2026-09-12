import type { Site } from "../content/Site";
import { CommandHistory } from "../shell/CommandHistory";
import { editLine } from "../shell/editLine";
import type { Outcome } from "../shell/Outcome";
import { parseCommandLine } from "../shell/parseCommandLine";
import type { Command } from "../shell/Command";
import { Shell } from "../shell/Shell";
import { suggest } from "../shell/suggest";
import { el } from "./el";

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

const PENDING_KEY = "shell-pending";

/** What the shell had still to do, carried over a `cd` to the next page. */
function carry(pending: string): void {
  try {
    if (pending) sessionStorage.setItem(PENDING_KEY, pending);
  } catch {
    // The next page simply starts clean.
  }
}

function takeCarried(): string {
  try {
    const value = sessionStorage.getItem(PENDING_KEY) ?? "";
    sessionStorage.removeItem(PENDING_KEY);
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
 * and does the few things only a page can do: move, clear, keep the cursor
 * where the caret is.
 *
 * Arriving on a page — by `cd`, by a link, by a real load — starts with an
 * empty screen. The page itself says which command printed it, so what the
 * shell had printed before would be telling the story out of order.
 */
export function mountTerminal(site: Site, route: string, options: TerminalOptions = {}): Terminal | null {
  const section = document.querySelector<HTMLElement>(".terminal");
  // The screen is the end of the paper, not part of the prompt: what the shell says is printed on the page.
  const screen = document.querySelector<HTMLElement>(".screen");
  const form = section?.querySelector<HTMLFormElement>("form.prompt");
  const input = form?.querySelector<HTMLInputElement>("input");
  const line = form?.querySelector<HTMLElement>(".line");
  const suggestion = form?.querySelector<HTMLElement>(".suggest");
  const ps1 = form?.querySelector<HTMLElement>(".ps1");
  // The prompt the paper ends on: it says where the session is, and a click on it sends the hand to the input.
  const end = document.querySelector<HTMLElement>(".ran.end");
  const endPs1 = end?.querySelector<HTMLElement>(".ps1");
  if (!section || !screen || !form || !input || !line || !suggestion || !ps1 || !end || !endPs1) return null;

  const showPrompt = () => {
    ps1.textContent = shell.prompt;
    endPs1.textContent = shell.prompt;
  };

  const shell = new Shell(site, route, options.commands);
  const history = new CommandHistory();
  let hint: HTMLElement | null = null;

  const print = (node: HTMLElement) => {
    screen.append(node);
  };

  const clearHint = () => {
    hint?.remove();
    hint = null;
  };

  // The block cursor stands where the caret is, and the suggestion where the typing ends.
  const refreshLine = () => {
    const caret = input.selectionStart ?? input.value.length;
    line.style.setProperty("--caret", String(caret));
    line.style.setProperty("--typed", String(input.value.length));
    suggestion.textContent = caret === input.value.length ? suggest(input.value, history.lines, shell.complete(input.value)) : "";
  };

  const setLine = (value: string, caret = value.length) => {
    input.value = value;
    input.setSelectionRange(caret, caret);
    refreshLine();
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
        if (options.navigate?.(outcome.navigate)) {
          screen.replaceChildren();
          continue;
        }
        carry(commands.slice(index + 1).join(" && "));
        window.location.assign(outcome.navigate);
        return;
      }
      perform(outcome);
      if (outcome.error) break;
    }
    showPrompt();
    refreshLine();
    // What was printed is the end of the paper; the paper scrolls so the last line stands over the prompt.
    window.scrollTo({ top: document.documentElement.scrollHeight });
  };

  const complete = () => {
    clearHint();
    if (input.value.trim() === "") {
      setLine("help");
      return;
    }
    const options = shell.complete(input.value);
    if (options.length === 1) {
      setLine(options[0] ?? input.value);
    } else if (options.length > 1) {
      // The candidates belong to the line being typed, so they show under the prompt, not on the paper.
      hint = el("p", { class: "hint" }, options.map((option) => option.split(" ").pop()).join("  "));
      form.insertAdjacentElement("afterend", hint);
      // The prompt grew by a line and would cover the last line of the paper; the paper moves up with it.
      window.scrollTo({ top: document.documentElement.scrollHeight });
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const line = input.value.trim();
    setLine("");
    if (!line) return;
    history.add(line);
    run(line);
  });

  // The last kill, waiting to be put back somewhere else.
  let killed = "";

  input.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      complete();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setLine(history.previous(input.value));
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setLine(history.next(input.value));
    } else if (event.key === "ArrowRight" && input.selectionStart === input.value.length && suggestion.textContent) {
      // At the end of the line, the arrow takes the suggestion, as fish does.
      event.preventDefault();
      setLine(input.value + suggestion.textContent);
    } else if (event.ctrlKey && !event.metaKey && !event.altKey) {
      const edited = editLine(event.key, input.value, input.selectionStart ?? input.value.length, killed);
      if (!edited) return;
      event.preventDefault();
      clearHint();
      setLine(edited.line, edited.caret);
      killed = edited.killed;
    } else {
      clearHint();
    }
  });

  for (const type of ["input", "keyup", "click", "focus", "select"]) input.addEventListener(type, refreshLine);
  document.addEventListener("selectionchange", () => {
    if (document.activeElement === input) refreshLine();
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

  // A click on the prompt's line, not only on the input, is a click into the prompt — and so is one on the paper's.
  form.addEventListener("click", () => input.focus());
  end.addEventListener("click", () => input.focus());

  refreshLine();

  // Pick up where the last page left off: the rest of its line, and what was typed since.
  const pending = takeCarried();
  if (pending) run(pending);
  const typed = replayTyped();
  if (typed) {
    for (const line of typed.finished) {
      if (line.trim()) {
        history.add(line.trim());
        run(line.trim());
      }
    }
    setLine(typed.unfinished);
    input.focus();
  }

  const moveTo = (to: string) => {
    if (!shell.moveTo(to)) return;
    screen.replaceChildren();
    showPrompt();
    refreshLine();
  };

  return { run, moveTo };
}
