import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { NextWordModel } from "./NextWordModel";
import { sentenceOf } from "./sentenceOf";
import { withTemperature } from "./withTemperature";

/** A model of a whole site learns thousands of transitions; the table shows the surest, and all that apply now. */
const ROWS = 40;
const OFFERED = 8;

const percent = (probability: number) => `${Math.round(probability * 100)}%`;

/**
 * Everything the reader sees of the model at one moment, as markup: the text
 * so far, what it may say next and how likely, and the table it is reading
 * that from. The build writes it for the first moment; the browser for all
 * the others.
 */
export function renderNextWord(model: NextWordModel, written: readonly string[], temperature: number): string {
  const { context, candidates } = model.after(written);
  const learnt = candidates.slice(0, OFFERED);
  const adjusted = withTemperature(candidates, temperature).slice(0, OFFERED);
  const seen = candidates.reduce((sum, { count }) => sum + count, 0);

  const before = written.slice(0, written.length - context.length);
  const text =
    `<p class="written">${escapeHtml(sentenceOf(before))}${before.length && context.length ? " " : ""}` +
    `${context.length ? `<mark>${escapeHtml(sentenceOf(context))}</mark>` : ""}<span class="caret"></span></p>`;

  const offered = learnt.length
    ? `<ol class="offered">${learnt
        .map(({ word, count, probability }, index) => {
          const now = adjusted[index]?.probability ?? 0;
          return (
            `<li><button type="button" data-word="${escapeHtml(word)}" title="seen ${count} of ${seen} times: ${percent(probability)} as learnt">` +
            `<span class="word">${escapeHtml(word)}</span><span class="chance" style="--p:${now.toFixed(3)}"></span><span class="figure">${percent(now)}</span></button></li>`
          );
        })
        .join("")}</ol>`
    : `<p class="offered">It never saw anything follow “${escapeHtml(written[written.length - 1] ?? "")}”. This is where it stops.</p>`;

  const applies = (transition: { context: readonly string[] }) => context.length === model.memory && transition.context.join(" ") === context.join(" ");
  const all = model.transitions();
  const rows = [...all.filter(applies), ...all.filter((transition) => !applies(transition))]
    .slice(0, ROWS)
    .map(
      (transition) =>
        `<tr${applies(transition) ? ' class="now"' : ""}><td>${escapeHtml(transition.context.join(" "))}</td><td>${escapeHtml(transition.word)}</td><td>${transition.count}</td><td>${percent(transition.probability)}</td></tr>`,
    )
    .join("");
  const table =
    `<table class="learnt"><caption>What it learnt: ${all.length} transitions between ${model.vocabulary.length} words${all.length > ROWS ? `, the first ${ROWS} shown` : ""}</caption>` +
    `<thead><tr><th>after</th><th>comes</th><th>seen</th><th>chance</th></tr></thead><tbody>${rows}</tbody></table>`;

  return `<div class="next-word">${text}<h4>What may come next</h4>${offered}${table}</div>`;
}
