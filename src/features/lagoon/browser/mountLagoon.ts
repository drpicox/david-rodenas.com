import { el } from "../../../platform/browser/el";
import type { Fisher } from "../Fisher";
import { ownFisher } from "../ownFisher";
import { ownFisherSource } from "../ownFisherSource";
import { renderLagoon } from "../renderLagoon";
import { theLagoon } from "../theLagoon";
import { Tournament } from "../Tournament";

const KEY = "lagoon:own";
const SEATED = "lagoon:seated";

/**
 * The lagoon with its two dials outside — how many fish it starts with, how
 * many weeks a round has — and a seat on the bank for the visitor's own bot:
 * the body of a function, compiled in their browser and kept there.
 */
export function mountLagoon(host: HTMLElement): void {
  let own: Fisher | null = null;
  let season: Tournament;

  const figure = el("div");
  const problem = el("p", { class: "error", hidden: true });
  const fishShown = el("output", {}, "100");
  const fish = el("input", { type: "range", min: 5, max: 200, step: 1, value: 100, oninput: () => restart() });
  const weeksShown = el("output", {}, "10");
  const weeks = el("input", { type: "range", min: 4, max: 14, step: 1, value: 10, oninput: () => restart() });
  const editor = el("textarea", { class: "agent", spellcheck: false, rows: 11, oninput: () => remember() });
  const bench = theLagoon().map(({ fisher, seated }) => ({ fisher, box: el("input", { type: "checkbox", checked: seated, onchange: () => restart() }) }));

  function draw(): void {
    figure.innerHTML = renderLagoon(season);
  }

  /** A new season: the lagoon restocked as the dials say, nothing learnt, whoever is seated. */
  function restart(): void {
    fishShown.textContent = fish.value;
    weeksShown.textContent = weeks.value;
    const seated = bench.filter(({ box }) => box.checked).map(({ fisher }) => fisher);
    season = new Tournament(Number(fish.value), Number(weeks.value), [...seated, ...(own ? [own] : [])]);
    draw();
  }

  function play(rounds: number): void {
    for (let round = 0; round < rounds; round += 1) season.play();
    draw();
  }

  function remember(): void {
    try {
      localStorage.setItem(KEY, editor.value);
    } catch {
      // A browser that keeps nothing still plays the season.
    }
  }

  function seat(): void {
    try {
      own = ownFisher(editor.value);
      problem.hidden = true;
      localStorage.setItem(SEATED, "yes");
    } catch (error) {
      own = null;
      problem.textContent = error instanceof Error ? error.message : String(error);
      problem.hidden = false;
      localStorage.removeItem(SEATED);
    }
    restart();
  }

  function unseat(): void {
    own = null;
    localStorage.removeItem(SEATED);
    restart();
  }

  const dials = el("div", { class: "dials" }, el("label", {}, "Fish in the lagoon at the start: ", fishShown, fish), el("label", {}, "Weeks in a round: ", weeksShown, weeks));
  const who = el("div", { class: "row bench" }, "On the lagoon: ", ...bench.map(({ fisher, box }) => el("label", {}, box, ` ${fisher.name}`)));
  const buttons = el(
    "div",
    { class: "row" },
    el("button", { type: "button", onclick: () => play(1) }, "play a round"),
    el("button", { type: "button", onclick: () => play(5) }, "play five"),
    el("button", { type: "button", onclick: () => restart() }, "new season"),
  );
  const seatRow = el("div", { class: "row" }, el("button", { type: "button", onclick: () => seat() }, "seat it"), el("button", { type: "button", onclick: () => unseat() }, "stand it down"));
  const yours = el("details", { class: "own" }, el("summary", {}, "Seat your own bot"), editor, seatRow, problem);

  try {
    editor.value = localStorage.getItem(KEY) ?? ownFisherSource;
    if (localStorage.getItem(SEATED)) own = ownFisher(editor.value);
  } catch {
    editor.value = ownFisherSource;
  }

  host.replaceChildren(dials, who, buttons, figure, yours);
  restart();
}
