import type { Still } from "../../platform/plugin/Feature";
import { renderGuessTable } from "./renderGuessTable";

/** Before any script: the first row, which is true whatever the rule is, and a word that the rest is played in the page. */
export const guessTheRuleStill: Still = () =>
  `<div class="guess-the-rule"><h4>Sequence numbers and their result:</h4>${renderGuessTable([{ a: 2, b: 4, c: 8, holds: true, last: false }])}<p class="guess-note">The rule is drawn, and the guessing played, when the page runs.</p></div>`;
