import { el } from "../../../platform/browser/el";
import type { Surroundings } from "../../../platform/plugin/Feature";
import { closestWord } from "../closestWord";
import { NextWordModel } from "../NextWordModel";
import { pickWord } from "../pickWord";
import { renderNextWord } from "../renderNextWord";
import { smallCorpus } from "../smallCorpus";
import { withTemperature } from "../withTemperature";
import { wordsOf } from "../wordsOf";

/** Long enough to read each word as it arrives, short enough to watch a sentence form. */
const PACE = 350;

/**
 * The model with its dials outside: what it reads, how far back it looks, how
 * much it may surprise, and the words to start from. One of the texts is this
 * website itself — the markdown is already in the browser, so reading it costs
 * nothing and the model ends up talking like the pages around it.
 */
export function mountNextWord(host: HTMLElement, { site }: Surroundings): () => void {
  const texts: Record<string, () => string> = {
    small: () => smallCorpus,
    site: () => site.pages.map((page) => page.body).join("\n\n"),
    own: () => corpus.value,
  };

  let model = new NextWordModel(smallCorpus, 1);
  let written = wordsOf("the");
  let running: ReturnType<typeof setInterval> | null = null;

  const figure = el("div");
  const option = (value: string | number, label: string) => el("option", { value }, label);
  const textSelect = el("select", { onchange: () => retrain() }, option("small", "eight short sentences"), option("site", "this website"), option("own", "your own text"));
  const memorySelect = el("select", { onchange: () => retrain() }, option(1, "one word back"), option(2, "two words back"), option(3, "three words back"));
  const corpus = el("textarea", { rows: 5, hidden: true, placeholder: "Paste any text here. The longer, the better it pretends.", oninput: () => retrain() });
  const shown = el("output", {}, "1");
  const temperature = el("input", { type: "range", min: 0, max: 2, step: 0.1, value: 1, oninput: () => draw() });
  const start = el("input", { type: "text", value: "the", onchange: () => restart() });
  const runButton = el("button", { type: "button", onclick: () => (running ? stop() : run()) }, "write");

  function draw(): void {
    shown.textContent = temperature.value;
    figure.innerHTML = renderNextWord(model, written, Number(temperature.value));
  }

  /** The words to start from, each read as the nearest word the model knows. */
  function restart(): void {
    stop();
    const known = wordsOf(start.value).flatMap((word) => closestWord(word, model.vocabulary) ?? []);
    written = known.length ? known : model.commonest ? [model.commonest] : [];
    draw();
  }

  function retrain(): void {
    corpus.hidden = textSelect.value !== "own";
    model = new NextWordModel(texts[textSelect.value]?.() ?? smallCorpus, Number(memorySelect.value));
    restart();
  }

  function step(): boolean {
    const word = pickWord(withTemperature(model.after(written).candidates, Number(temperature.value)), Math.random);
    if (word === null) return false;
    written = [...written, word];
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
    runButton.textContent = "write";
  }

  // A word that is offered can be chosen by hand, which is the quickest way to see what the dice are for.
  figure.addEventListener("click", (event) => {
    const word = (event.target as Element | null)?.closest("[data-word]")?.getAttribute("data-word");
    if (!word) return;
    written = [...written, word];
    draw();
  });

  const controls = el(
    "div",
    { class: "dials" },
    el("label", {}, "It has read", textSelect),
    el("label", {}, "It looks", memorySelect),
    el("label", {}, "Temperature: ", shown, temperature),
    el("label", {}, "Start from", start),
  );
  const buttons = el("div", { class: "row" }, el("button", { type: "button", onclick: () => void step() }, "next word"), runButton, el("button", { type: "button", onclick: () => restart() }, "start over"));
  host.replaceChildren(controls, corpus, buttons, figure);
  draw();

  return stop;
}
