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
  bar0: "The Fibergochi at the bar with its friends, drinks on the table.",
  amig: "The Fibergochi with a group of friends.",
  suplica: "The Fibergochi on the floor, begging.",
};

/**
 * The keys on the egg, in their rows: what each does, its own little drawing
 * of 1999, its name, and what the status bar said when the mouse was over
 * it, put into English.
 */
const KEYS = [
  [["study", "estudio", "Study/Sleep", "to study or to sleep."]],
  [
    ["http", "http", "http", "to have a good time at a terminal (if you have one)."],
    ["alfa", "alfa", "alfa", "see the score."],
    ["bar", "bar", "Bar", "go to the bar, have a drink or play mus."],
  ],
  "screen",
  [
    ["friends", "amigos", "Friends", "to make new friends."],
    ["terminal", "bt", "Find terminal", "look for a terminal to do labs, or not."],
    ["beg", "suplica", "Beg", "to try to get more passes."],
  ],
] as const;

/** The three speeds of 1999, a step every second, every 0.4 seconds, or every hundredth. */
const PACES = { slow: "slow", normal: "normal", fast: "fast" } as const;

/** How much work, in words and in the Fibergochi's own hours of three steps: a little is under one, a lot is five or more. */
function amount(steps: number, [none, little, some, lot]: readonly string[]): string {
  if (steps <= 0) return none!;
  if (steps < 3) return `${little}, under an hour`;
  const hours = Math.round(steps / 3);
  return `${steps < 15 ? some : lot}, about ${hours} ${hours === 1 ? "hour" : "hours"}`;
}

const button = (does: string, label: string, { title = "", disabled = false } = {}) =>
  `<button type="button" data-do="${does}"${title ? ` title="${escapeHtml(title)}"` : ""}${disabled ? " disabled" : ""}>${label}</button>`;

/**
 * The egg and everything around it, as one piece of HTML: the build writes it
 * before any script runs, and the browser writes it again when something more
 * than the picture, the lamps, the clock and what the lamps mean changes.
 * Those are marked `data-show`, so a beat can copy just them across and leave
 * the focus where it was.
 */
export function renderFibergochi(
  fibergochi: Fibergochi,
  { running, confirmingNew, pace, picked = null }: { running: boolean; confirmingNew: boolean; pace: keyof typeof PACES; picked?: string | null },
): string {
  // The keys on the egg answer nobody while a box is open, as nothing did behind an alert, nor after the end.
  const disabled = !fibergochi.alive || fibergochi.waiting || confirmingNew;
  const lit = (on: boolean) => (on && fibergochi.lampsLit ? "on" : "off");
  const lamps = [
    ["exam", lit(fibergochi.examsPending), amount(fibergochi.studyLeft, ["nothing to study", "a little to study", "something to study", "a lot to study"])],
    ["lab", lit(fibergochi.labsPending), amount(fibergochi.labLeft, ["no lab to do", "a little lab work", "some lab work", "a lot of lab work"])],
    ["terminal", fibergochi.hasTerminal ? "on" : "off", fibergochi.hasTerminal ? "a terminal" : fibergochi.labsPending ? "no terminal, and labs need one" : "no terminal"],
  ];
  // On the egg, as in 1999, a lamp says what it is when the mouse is over it; pressed, it marks its line under the date.
  const onEgg = lamps
    .map(([lamp, on, said]) => `<li><button type="button" class="lamp ${on}" data-do="lamp-${lamp}" data-lamp="${lamp}" title="${lamp}: ${said}">${lamp}</button></li>`)
    .join("");
  const legend = lamps
    .map(([lamp, on, said]) => `<li class="${on}${lamp === picked ? " picked" : ""}" data-lamp="${lamp}"><b>${lamp}</b> ${said}</li>`)
    .join("");
  const picture = fibergochi.picture;
  const seen = SEEN[picture.replace(/\d$/, "")] ?? "";
  const screen = `<div class="screen"><ul class="lamps" data-show="lamps">${onEgg}</ul><img data-show="picture" src="/fibergochi/${picture}.gif" alt="${seen}" width="200" height="160"></div>`;
  const egg = KEYS.map((row) =>
    row === "screen"
      ? screen
      : `<div class="keys">${row
          .map(([does, key, label, title]) => {
            // Twice their size, so a finger can find them: they were drawn at 22 by 21, all but alfa's.
            const [width, height] = key === "alfa" ? [15, 11] : [22, 21];
            return button(does, `<img src="/fibergochi/keys/${key}.gif" alt="${label}" width="${width * 2}" height="${height * 2}">`, { title: `${label}: ${title}`, disabled });
          })
          .join("")}</div>`,
  ).join("");

  return `<div class="fibergochi"><div class="egg"><p class="by"><span>by</span> Night</p>${egg}</div><div class="panel"><p class="time"><output data-show="clock">${fibergochi.clock}</output> ${button("pause", running ? "pause" : "go on")} ${button("speed", `speed: ${PACES[pace]}`, { title: "Change the speed of time." })} ${button("new", "new")}</p><ul class="legend" data-show="legend">${legend}</ul>${dialog(fibergochi, confirmingNew)}</div></div>`;
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
