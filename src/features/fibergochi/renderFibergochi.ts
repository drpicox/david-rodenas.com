import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { Fibergochi } from "./Fibergochi";

/** What each series of drawings shows, for whoever cannot see them. */
const SEEN: Record<string, string> = {
  x: "A cross: there is no Fibergochi.",
  normal: "The Fibergochi, standing about.",
  normal1: "The Fibergochi, standing about, getting bored.",
  normal2: "The Fibergochi, bored stiff.",
  est: "The Fibergochi at a desk, studying.",
  zz: "The Fibergochi, asleep.",
  bt: "A room full of terminals, all taken, and the Fibergochi looking for a free one.",
  http: "A terminal, and the Fibergochi browsing: http.",
  pract: "The Fibergochi at a terminal, doing a lab.",
  no: "The Fibergochi, shaking its head.",
};

/** The buttons on the egg, in their rows, with what the status bar said when the mouse was over each, put into English. */
const KEYS = [
  [["study", "Study/Sleep", "To study or to sleep."]],
  [
    ["http", "http", "To have a good time at a terminal (if you have one)."],
    ["alfa", "alfa", "See the score."],
    ["bar", "Bar", "Go to the bar, have a drink or play mus."],
  ],
  "screen",
  [
    ["friends", "Friends", "To make new friends."],
    ["terminal", "Find terminal", "Look for a terminal to do labs, or not."],
    ["beg", "Beg", "Beg, to try to get more passes."],
  ],
] as const;

const button = (does: string, label: string, { title = "", disabled = false } = {}) =>
  `<button type="button" data-do="${does}"${title ? ` title="${escapeHtml(title)}"` : ""}${disabled ? " disabled" : ""}>${label}</button>`;

/**
 * The egg and everything around it, as one piece of HTML: the build writes it
 * before any script runs, and the browser writes it again when something more
 * than the picture, the lamps and the clock changes. Those three are marked
 * `data-show`, so a beat can copy just them across and leave the focus where
 * it was.
 */
export function renderFibergochi(fibergochi: Fibergochi, { running, confirmingNew }: { running: boolean; confirmingNew: boolean }): string {
  const { day, hour } = fibergochi.state;
  // The keys on the egg answer nobody while a box is open, as nothing did behind an alert, nor after the end.
  const disabled = !fibergochi.alive || fibergochi.waiting || confirmingNew;
  // After the last day of class a lamp blinks, an hour on and an hour off.
  const lit = (on: boolean) => (on && (day < 20 || hour % 2 === 1) ? "on" : "off");
  const lamps = [
    ["exam", "Whether there is an exam.", lit(fibergochi.examsPending)],
    ["lab", "Whether there is a lab.", lit(fibergochi.labsPending)],
    ["terminal", "Whether it has a terminal.", fibergochi.hasTerminal ? "on" : "off"],
  ]
    .map(([name, title, on]) => `<li class="${on}" data-lamp="${name}" title="${title}">${name}</li>`)
    .join("");
  const picture = fibergochi.picture;
  const seen = SEEN[picture.replace(/\d$/, "")] ?? "";
  const screen = `<div class="screen"><ul class="lamps" data-show="lamps">${lamps}</ul><img data-show="picture" src="/fibergochi/${picture}.gif" alt="${seen}" width="200" height="160"></div>`;
  const egg = KEYS.map((row) =>
    row === "screen" ? screen : `<div class="keys">${row.map(([does, label, title]) => button(does, label, { title, disabled })).join("")}</div>`,
  ).join("");

  return `<div class="fibergochi"><div class="egg"><p class="by"><span>by</span> Night</p>${egg}</div><div class="panel"><p class="time"><output data-show="clock">${fibergochi.clock}</output> ${button("pause", running ? "pause" : "go on")} ${button("new", "new")}</p>${dialog(fibergochi, confirmingNew)}</div></div>`;
}

/** Whatever an alert, a confirm or a prompt asked in 1999, in the order they came. */
function dialog(fibergochi: Fibergochi, confirmingNew: boolean): string {
  const { said, asks } = fibergochi.state;
  const box = (text: string, ...buttons: string[]) => `<div class="dialog" role="alertdialog"><p>${escapeHtml(text).replaceAll("\n", "<br>")}</p><p>${buttons.join(" ")}</p></div>`;
  if (confirmingNew) return box("Are you sure you want a new Fibergochi?", button("new-yes", "OK"), button("new-no", "Cancel"));
  if (said.length > 0) return box(said[0]!, button("ok", "OK"));
  if (asks === "degree") return box("Do you want to do the Superior?", button("superior", "OK"), button("tecnica", "Cancel"));
  if (asks === "enrol") {
    const { most, suggested } = fibergochi.enrolment;
    return `<form class="dialog" data-do="enrol"><label>How many credits do you want to enrol in? [1..${most}] <input type="number" name="credits" min="1" max="${most}" value="${suggested}"></label> <button type="submit">OK</button></form>`;
  }
  return "";
}
