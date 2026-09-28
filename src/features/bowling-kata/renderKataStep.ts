import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { highlight } from "../../platform/markdown/highlight";
import { lineDiff } from "./lineDiff";
import { kataLessonAt } from "./kataLessonAt";
import type { KataStep } from "./KataStep";
import { runKata } from "./runKata";

/** What each move is, and not how it came out: the bar says that. */
const MOVES: Readonly<Record<KataStep["stage"], string>> = { test: "Test: write or change a test", code: "Code: write what the test asks for", clean: "Clean: tidy, and stay green" };

const CLASSES = { same: "line", added: "line added", removed: "line removed" } as const;

/**
 * A file of the commit, with what the commit did to it: the lines it added
 * marked, and the ones it took away still there, struck through, where they
 * were. `empty` is what to say when the file has nothing in it yet.
 */
function file(name: string, source: string, before: string | undefined, empty: string): string {
  const diff = before === undefined ? source.split("\n").map((line) => ({ kind: "same" as const, line })) : lineDiff(before, source);
  if (!source.trim() && !diff.some((line) => line.kind === "removed")) return `<figure class="kata-file"><figcaption>${name}</figcaption><p class="kata-empty">${empty}</p></figure>`;
  const lines = diff.map(({ kind, line }) => `<span class="${CLASSES[kind]}">${highlight(line, "js") || " "}</span>`);
  return `<figure class="kata-file"><figcaption>${name}</figcaption><pre><code>${lines.join("\n")}</code></pre></figure>`;
}

/**
 * One commit of the kata: which move it is, what the tests said when they
 * ran — red with the runner's own words, or green — both files with the lines
 * this commit changed marked, the smells still waiting to be cleaned, and
 * whatever the slide says beside it.
 */
export function renderKataStep(step: KataStep, previous?: KataStep): string {
  const run = runKata(step.test, step.code);
  const bar = run.passed ? '<p class="kata-bar green">All tests pass.</p>' : `<p class="kata-bar red">${escapeHtml(run.message ?? "")}</p>`;
  const smells = step.smells.length ? `<div class="kata-smells"><h4>Still to clean</h4><ul>${step.smells.map((smell) => `<li>${escapeHtml(smell)}</li>`).join("")}</ul></div>` : "";
  const note = step.note ? `<p class="kata-note">${escapeHtml(step.note)}</p>` : "";
  const lesson = kataLessonAt(step.commit);
  const taught = lesson
    ? `<aside class="kata-lesson"><h4>${escapeHtml(lesson.title)}</h4><p>${escapeHtml(lesson.text)} <a href="https://medium.com/p/${lesson.essay.id}" target="_blank" rel="noopener noreferrer">${escapeHtml(lesson.essay.title)}${lesson.essay.section ? ` — ${escapeHtml(lesson.essay.section)}` : ""}</a></p></aside>`
    : "";
  return (
    `<div class="kata-step"><p class="kata-move"><strong>commit ${step.commit}</strong> · ${MOVES[step.stage]}</p>${bar}${taught}` +
    `<div class="kata-files">${file("bowling.spec.js", step.test, previous?.test, "An empty file.")}${file("bowling.js", step.code, previous?.code, "Not written yet.")}</div>` +
    `${note}${smells}</div>`
  );
}
