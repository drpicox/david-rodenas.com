import { el } from "../../../platform/browser/el";
import { GuessRound } from "../GuessRound";
import { renderGuessTable } from "../renderGuessTable";
import { RULES } from "../RULES";

/**
 * Guess the rule, played: a rule is drawn once, when the page opens; the
 * reader tries sequences and sees each one ✅ or ❌, then guesses the rule as
 * an expression of a, b and c. Reloading the page draws another.
 */
export function mountGuessTheRule(host: HTMLElement, random: () => number = Math.random): void {
  const round = new GuessRound(RULES[Math.floor(RULES.length * random())] ?? RULES[0]!);
  const table = el("div", { class: "guess-rows" });
  const number = (value: number, label: string) => el("input", { type: "number", value, "aria-label": label });
  const [a, b, c] = [number(2, "a"), number(4, "b"), number(8, "c")];
  const tested = el("p", { class: "guess-said", "data-said": "test", hidden: true });
  const rule = el("input", { type: "text", value: "true", spellcheck: false, autocapitalize: "off", "aria-label": "The rule, in JavaScript" });
  const guessed = el("p", { class: "guess-said", "data-said": "guess", hidden: true });

  const say = (where: HTMLElement, words: string) => {
    where.textContent = words;
    where.hidden = !words;
    where.classList.toggle("good", words.startsWith("Good!"));
  };
  const draw = () => {
    table.innerHTML = renderGuessTable(round.rows);
  };
  const test = () => {
    say(tested, round.test(Number(a.value), Number(b.value), Number(c.value)));
    draw();
  };
  const guess = () => say(guessed, round.guess(rule.value));

  const testButton = el("button", { type: "button", class: "test", onclick: test }, "Test");
  const guessButton = el("button", { type: "button", class: "guess", onclick: guess }, "Guess");
  for (const field of [a, b, c]) field.addEventListener("keydown", (event) => event.key === "Enter" && test());
  rule.addEventListener("keydown", (event) => event.key === "Enter" && guess());

  host.replaceChildren(
    el(
      "div",
      { class: "guess-the-rule" },
      el("h4", {}, "Sequence numbers and their result:"),
      table,
      el("h4", {}, "Propose a new sequence:"),
      el("p", { class: "guess-sequence" }, "a: ", a, ", b: ", b, ", c: ", c, " ", testButton),
      tested,
      el("h4", {}, "Propose a rule:"),
      el("p", { class: "guess-rule" }, rule, " ", guessButton),
      guessed,
      el("p", { class: "guess-note" }, "Write any valid javascript expression that evaluates true or false. Use variables a, b and c in the expression."),
    ),
  );
  draw();
}
