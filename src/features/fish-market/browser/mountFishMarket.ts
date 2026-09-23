import { el } from "../../../platform/browser/el";
import type { Bidder } from "../Bidder";
import type { DutchAuction } from "../DutchAuction";
import { openAuction } from "../openAuction";
import { ownBidder } from "../ownBidder";
import { ownBidderSource } from "../ownBidderSource";
import { renderFishMarket } from "../renderFishMarket";
import { theTable } from "../theTable";

/** Long enough to read a sale as it happens, short enough to watch a morning go by. */
const PACE = 250;
/** The morning the build drew, so the page changes nothing when the script arrives. */
const FIRST_SEED = 1;
const KEY = "fish-market:own";
const SEATED = "fish-market:seated";

/**
 * The auction with its dials outside — how greedy Vicente is, how much money
 * is in the room — and a seat at the table for the visitor's own agent: the
 * body of a function, compiled in their browser and kept there. A mistake in
 * it is shown in the engine's own words and the auction goes on without it.
 */
export function mountFishMarket(host: HTMLElement): () => void {
  let seed = FIRST_SEED;
  let own: Bidder | null = null;
  let auction: DutchAuction;
  let running: ReturnType<typeof setInterval> | null = null;

  const figure = el("div");
  const problem = el("p", { class: "error", hidden: true });
  const greedShown = el("output", {}, "90%");
  const greed = el("input", { type: "range", min: 0.5, max: 1, step: 0.02, value: 0.9, oninput: () => reopen() });
  const moneyShown = el("output", {}, "50%");
  const money = el("input", { type: "range", min: 0.3, max: 1.2, step: 0.05, value: 0.5, oninput: () => reopen() });
  const editor = el("textarea", { class: "agent", spellcheck: false, rows: 9, oninput: () => remember() });
  const runButton = el("button", { type: "button", onclick: () => (running ? stop() : run()) }, "run");

  function draw(): void {
    figure.innerHTML = renderFishMarket(auction);
  }

  /** The same morning again, with the dials as they are now and whoever is seated. */
  function reopen(): void {
    stop();
    greedShown.textContent = `${Math.round(Number(greed.value) * 100)}%`;
    moneyShown.textContent = `${Math.round(Number(money.value) * 100)}%`;
    auction = openAuction(seed, [...theTable(Number(greed.value)), ...(own ? [own] : [])], Number(money.value));
    draw();
  }

  function step(): boolean {
    if (auction.over) return false;
    auction.sell();
    draw();
    return true;
  }

  function run(): void {
    runButton.textContent = "stop";
    running = setInterval(() => {
      if (!step()) stop();
    }, PACE);
  }

  function stop(): void {
    if (running) clearInterval(running);
    running = null;
    runButton.textContent = "run";
  }

  function remember(): void {
    try {
      localStorage.setItem(KEY, editor.value);
    } catch {
      // A browser that keeps nothing still runs the auction.
    }
  }

  function seat(): void {
    try {
      own = ownBidder(editor.value);
      problem.hidden = true;
      localStorage.setItem(SEATED, "yes");
    } catch (error) {
      own = null;
      problem.textContent = error instanceof Error ? error.message : String(error);
      problem.hidden = false;
      localStorage.removeItem(SEATED);
    }
    reopen();
  }

  function unseat(): void {
    own = null;
    localStorage.removeItem(SEATED);
    reopen();
  }

  const dials = el(
    "div",
    { class: "dials" },
    el("label", {}, "Vicente believes the others will spend: ", greedShown, greed),
    el("label", {}, "Money in the room, as a share of the fish: ", moneyShown, money),
  );
  const buttons = el(
    "div",
    { class: "row" },
    el("button", { type: "button", onclick: () => void step() }, "next lot"),
    runButton,
    el(
      "button",
      {
        type: "button",
        onclick: () => {
          stop();
          while (step());
        },
      },
      "whole morning",
    ),
    el(
      "button",
      {
        type: "button",
        onclick: () => {
          seed = Math.floor(Math.random() * 1e9);
          reopen();
        },
      },
      "new morning",
    ),
  );
  const seatRow = el("div", { class: "row" }, el("button", { type: "button", onclick: () => seat() }, "seat it"), el("button", { type: "button", onclick: () => unseat() }, "stand it down"));
  const yours = el("details", { class: "own" }, el("summary", {}, "Seat your own agent"), editor, seatRow, problem);

  try {
    editor.value = localStorage.getItem(KEY) ?? ownBidderSource;
    if (localStorage.getItem(SEATED)) own = ownBidder(editor.value);
  } catch {
    editor.value = ownBidderSource;
  }

  host.replaceChildren(dials, buttons, figure, yours);
  reopen();

  return stop;
}
