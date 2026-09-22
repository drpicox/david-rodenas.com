import { el } from "../../../platform/browser/el";
import { Adventure } from "../Adventure";
import { renderAdventure } from "../renderAdventure";

const KEY = "adventure";
const COMMANDS = ["north", "south", "east", "west", "take", "attack"] as const;

/**
 * The game at a prompt of its own, with the six words as buttons for whoever
 * would rather press than type, and the game kept in the browser between
 * visits the way `salvar` kept it in a file.
 */
export function mountAdventure(host: HTMLElement): () => void {
  let game = restore() ?? new Adventure();
  const screen = el("div");
  const log = el("p", { class: "said" });
  const input = el("input", { type: "text", autocomplete: "off", spellcheck: false, placeholder: "north, south, east, west, take, attack" });

  function draw(said = ""): void {
    screen.innerHTML = renderAdventure(game);
    log.textContent = game.spent && !said ? "Game over; better luck next time." : said;
    if (game.won) log.textContent = "CONGRATULATIONS! You have reached the pantry.";
    keep();
  }

  function run(line: string): void {
    const said = game.run(line);
    draw(said);
    input.value = "";
    input.focus();
  }

  function keep(): void {
    try {
      localStorage.setItem(KEY, game.save());
    } catch {
      // Without storage the game lasts as long as the page.
    }
  }

  const form = el("form", { onsubmit: (event: Event) => (event.preventDefault(), run(input.value)) }, el("span", { class: "ps1" }, "> "), input);
  const buttons = el(
    "div",
    { class: "row" },
    ...COMMANDS.map((word) => el("button", { type: "button", onclick: () => run(word) }, word)),
    el(
      "button",
      { type: "button", class: "quiet", onclick: () => ((game = new Adventure()), draw("")) },
      "start again",
    ),
  );

  host.replaceChildren(screen, log, form, buttons);
  draw("");
  return () => keep();
}

function restore(): Adventure | null {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? Adventure.load(saved) : null;
  } catch {
    return null;
  }
}
