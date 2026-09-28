import { el } from "../../../platform/browser/el";
import { watchOnScreen } from "../../../platform/browser/watchOnScreen";
import type { App } from "../../../platform/plugin/Feature";
import type { Layout } from "../Layout";
import { layoutArchitecture } from "../layoutArchitecture";
import { type ColourLens, type LensChoice, lensesOf, type Pointing } from "../lensesOf";
import { metricsOf } from "../metricsOf";
import type { Sizing } from "../radiiBy";
import type { HistoryRead } from "../readHistory";
import { reachedByTests } from "../reachedByTests";
import { renderArchitectureCaption } from "../renderArchitectureCaption";
import { renderMetricsSparks } from "../renderMetricsSparks";
import { sourceUrlOf } from "../sourceUrlOf";
import { ArchitectureScene, type Colours, type Mode } from "./ArchitectureScene";
import { changesInBrowser } from "./changesInBrowser";
import type { shownCommit } from "./shownCommit";

const WIDTH = 1100;
/** How long each commit is shown while the history plays. */
const BEAT = 0.45;

/** A commit a whole page shows, which the picture follows when it is one of the page's figures. */
type SharedCommit = Pick<typeof shownCommit, "get" | "set" | "on">;

export interface ArchitectureOptions {
  /** The page's own commit, when the picture is one of its figures: then the page's player moves it, and it has none of its own. */
  readonly follow?: SharedCommit;
  /** The page's own commit, when the picture leads it: the figures under it follow its player. */
  readonly lead?: SharedCommit;
  /** The lenses it starts with. */
  readonly lenses?: Partial<LensChoice>;
}

const STARTING: LensChoice = { sizing: "neededBy", colour: "plain", together: false, pointing: "1" };

function coloursOf(element: Element): Colours {
  const style = getComputedStyle(element);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    ink: read("--ink", "#16181c"),
    dim: read("--dim", "#6b7280"),
    rule: read("--rule", "#d8dbe1"),
    sunken: read("--sunken", "#f2f4f8"),
    accent: read("--accent", "#1a4b9c"),
    soft: read("--accent-soft", "#6b83b8"),
    warn: read("--warn", "#b4443c"),
    test: read("--hl-string", "#2f6f4e"),
    arrowIn: read("--arrow-in", "#c96a24"),
    heat: read("--heat-warm", "#e08a5b"),
    heatTop: read("--heat-warm-top", "#5c1609"),
  };
}

/**
 * The picture of the source, made to move and to be looked through: the
 * history played commit by commit, each file flying to where the next commit
 * puts it; the same source tangled, with no boxes, only the pull of what
 * needs what; the tests put in; and lenses — a ball as big as what is asked,
 * coloured by what is asked, the threads of what changed together over the
 * arrows, and what pointing at a file brings out. The still the build wrote
 * is the last commit, and it stands until the history has arrived.
 */
export function mountArchitecture(options: ArchitectureOptions = {}): App {
  return (host) => {
    let stopped = false;
    let stop = () => {
      stopped = true;
    };
    // A page arrived at shows the last commit, whatever the page before it was showing.
    options.lead?.set(null);
    changesInBrowser()
      .then(({ read, coverage }) => {
        if (stopped) return;
        stop = play(host, read, coverage, options);
      })
      .catch(() => {
        // Without the history the still stays, and it is the last commit already.
      });
    return () => stop();
  };
}

function play(host: HTMLElement, read: HistoryRead, counted: { sha: string; lines: Readonly<Record<string, number>> } | null, options: ArchitectureOptions): () => void {
  const { history, snapshots } = read;
  // The lines the tests run were counted at one commit only; the pies are drawn there, and the rings everywhere else.
  const coverageAt = counted && history.commits.findIndex((commit) => commit.sha === counted.sha);
  const coverage = counted ? new Map(Object.entries(counted.lines)) : null;
  const metrics = snapshots.map(metricsOf);
  const layouts = new Map<string, Layout>();
  const layoutAt = (at: number, tests: boolean) => {
    const key = `${at}:${tests}`;
    let layout = layouts.get(key);
    if (!layout) {
      layout = layoutArchitecture(snapshots[at] ?? { modules: [], dependencies: [] }, { tests, width: WIDTH });
      layouts.set(key, layout);
    }
    return layout;
  };
  const last = snapshots.length - 1;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = new ArchitectureScene(WIDTH, still);
  const { follow } = options;

  let at = follow?.get() ?? last;
  let tests = false;
  let choice: LensChoice = { ...STARTING, ...options.lenses };
  let mode: Mode = "boxes";
  let playing = false;
  let beat = 0;
  /** The commit last shown, so that what a commit changed rings when it comes, and not again when the picture is only redrawn. */
  let shown = -1;
  scene.pointing = choice.pointing;

  const canvas = el("canvas", { class: "architecture-canvas", "aria-label": "The source of this site: its files as balls, its folders as boxes, and arrows for what needs what" });
  const caption = el("figcaption");
  const sparks = el("div", { class: "sparks-host" });
  const slider = el("input", { type: "range", min: 0, max: last, step: 1, value: at, "aria-label": "Commit", hidden: follow !== undefined });
  const playButton = el("button", { type: "button", hidden: follow !== undefined }, "▶ play the history");
  const tangleButton = el("button", { type: "button" }, "tangle it");
  const testsBox = el("input", { type: "checkbox" });
  const togetherBox = el("input", { type: "checkbox", checked: choice.together });
  const option = (value: string, words: string) => el("option", { value, selected: false }, words);
  const selectOf = (label: string, chosen: string, options: [string, string][]) => {
    const select = el("select", { "aria-label": label }, ...options.map(([value, words]) => option(value, words)));
    select.value = chosen;
    return select;
  };
  const sizeBox = selectOf("What a ball's size says", choice.sizing, [["neededBy", "needed by"], ["needs", "needs"], ["reachedBy", "reach"], ["bridges", "bridges"], ["changes", "changes"], ["lines", "lines"]]);
  const colourBox = selectOf("What a ball's colour says", choice.colour, [["plain", "plain"], ["heat", "heat"], ["exposure", "exposure"], ["stability", "stability"]]);
  const pointingBox = selectOf("What pointing at a file shows", choice.pointing, [["1", "its arrows"], ["2", "arrows, 2 out"], ["3", "arrows, 3 out"], ["all", "all its arrows"], ["group", "its group"], ["together", "what changed with it"]]);
  const controls = el(
    "div",
    { class: "architecture-controls" },
    playButton,
    tangleButton,
    el("label", {}, testsBox, " the tests"),
    el("label", {}, togetherBox, " what changed together"),
    slider,
  );
  const lensControls = el("div", { class: "architecture-controls lenses" }, el("label", {}, "size: ", sizeBox), el("label", {}, "colour: ", colourBox), el("label", {}, "pointing shows: ", pointingBox));
  // What the lenses show, in words; and what the shapes mean, while the tests are in, since it is only then there is more than one.
  const said = el("p", { class: "architecture-legend lenses-said" });
  const legend = el(
    "p",
    { class: "architecture-legend", hidden: true },
    el("span", { class: "key file" }),
    "a file, as full as the tests run it",
    el("span", { class: "key untested" }),
    "a file no test reaches",
    el("span", { class: "key test" }),
    "a test",
  );

  const showCommit = (next: number, untangling = false) => {
    at = Math.max(0, Math.min(last, next));
    slider.value = String(at);
    const snapshot = snapshots[at];
    const commit = history.commits[at];
    if (!snapshot || !commit) return;
    const lenses = lensesOf(read, at, choice);
    scene.show(snapshot, layoutAt(at, tests), {
      untangling,
      reached: tests ? reachedByTests(snapshot) : null,
      coverage: tests && at === coverageAt ? coverage : null,
      sizes: lenses.sizes,
      changed: at === shown ? null : new Set(history.changes[at]?.changed ?? []),
      seen: lenses,
    });
    shown = at;
    options.lead?.set(at >= last ? null : at);
    said.textContent = lenses.said;
    caption.innerHTML = renderArchitectureCaption(commit, metrics[at] ?? metricsOf(snapshot));
    sparks.innerHTML = renderMetricsSparks(metrics, at);
  };
  const choose = (parts: Partial<LensChoice>) => {
    choice = { ...choice, ...parts };
    scene.pointing = choice.pointing;
    showCommit(at);
  };
  // Following the page, a commit is asked of the page, and the page answers every figure at once.
  const goTo = (commit: number) => (follow ? follow.set(commit >= last ? null : commit) : showCommit(commit));

  const setPlaying = (value: boolean) => {
    playing = value;
    playButton.textContent = playing ? "❚❚ pause" : "▶ play the history";
    if (playing && at === last) showCommit(0);
    beat = 0;
  };

  playButton.addEventListener("click", () => setPlaying(!playing));
  tangleButton.addEventListener("click", () => {
    mode = mode === "boxes" ? "tangle" : "boxes";
    scene.setMode(mode);
    tangleButton.textContent = mode === "boxes" ? "tangle it" : "untangle it";
    if (mode === "boxes") showCommit(at, true);
  });
  testsBox.addEventListener("change", () => {
    tests = testsBox.checked;
    legend.hidden = !tests;
    showCommit(at);
  });
  togetherBox.addEventListener("change", () => choose({ together: togetherBox.checked }));
  sizeBox.addEventListener("change", () => choose({ sizing: sizeBox.value as Sizing }));
  colourBox.addEventListener("change", () => choose({ colour: colourBox.value as ColourLens }));
  pointingBox.addEventListener("change", () => choose({ pointing: pointingBox.value as Pointing }));
  slider.addEventListener("input", () => {
    setPlaying(false);
    showCommit(Number(slider.value));
  });
  const stopFollowing = follow?.on((commit) => showCommit(commit ?? last)) ?? (() => {});
  // The lines below are a drawing scaled to fit: a point on them is read in the drawing's own units, and it can be dragged along.
  const commitUnder = (event: PointerEvent) => {
    const drawing = sparks.querySelector("svg");
    const matrix = drawing?.getScreenCTM();
    if (!drawing || !matrix) return null;
    const x = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()).x;
    const { x: left, width } = drawing.viewBox.baseVal;
    const PAD = 4;
    return Math.round(((x - left - PAD) / (width - PAD * 2)) * last);
  };
  const scrub = (event: PointerEvent) => {
    const commit = commitUnder(event);
    if (commit === null) return;
    setPlaying(false);
    if (Math.max(0, Math.min(last, commit)) !== at) goTo(Math.max(0, Math.min(last, commit)));
  };
  sparks.addEventListener("pointerdown", (event) => {
    sparks.setPointerCapture(event.pointerId);
    scrub(event);
  });
  sparks.addEventListener("pointermove", (event) => {
    if (sparks.hasPointerCapture(event.pointerId)) scrub(event);
  });

  const toScene = (event: MouseEvent) => {
    const box = canvas.getBoundingClientRect();
    return [((event.clientX - box.left) / box.width) * WIDTH, ((event.clientY - box.top) / box.height) * scene.height] as const;
  };
  canvas.addEventListener("mousemove", (event) => {
    const [x, y] = toScene(event);
    scene.hovered = scene.hit(x, y);
    canvas.style.cursor = scene.hovered.path || scene.hovered.box ? "pointer" : "";
    // What is under the pointer, said on the element too, for whoever reads the page without looking at it.
    canvas.dataset["hovered"] = scene.hovered.path ?? scene.hovered.box ?? "";
  });
  canvas.addEventListener("mouseleave", () => {
    scene.hovered = {};
  });
  // A file, or a box, opens where its source is, as it stood at the commit shown.
  canvas.addEventListener("click", (event) => {
    const [x, y] = toScene(event);
    const hit = scene.hit(x, y);
    const sha = history.commits[at]?.sha;
    if (!sha) return;
    const url = hit.path ? sourceUrlOf(sha, hit.path) : hit.box ? sourceUrlOf(sha, hit.box, "box") : null;
    if (url) window.open(url, "_blank", "noopener");
  });

  host.replaceChildren(el("figure", { class: "architecture-figure" }, controls, lensControls, canvas, said, legend, caption, sparks));
  showCommit(at);

  const context = canvas.getContext("2d");
  if (!context) return stopFollowing;
  const watch = watchOnScreen(canvas);
  let colours = coloursOf(host);
  let frames = 0;
  let previous = performance.now();
  let frame = 0;

  // The canvas is as tall as the picture is now, and follows it: sized again only when it has moved by a pixel.
  let sizedAt = { width: 0, height: 0 };
  const size = () => {
    const ratio = window.devicePixelRatio || 1;
    const shownWidth = canvas.clientWidth || WIDTH;
    const tall = Math.round((shownWidth * scene.height) / WIDTH);
    if (shownWidth === sizedAt.width && Math.abs(tall - sizedAt.height) < 1) return;
    sizedAt = { width: shownWidth, height: tall };
    canvas.width = Math.round(shownWidth * ratio);
    canvas.height = Math.round(tall * ratio);
    canvas.style.height = `${tall}px`;
  };
  size();
  window.addEventListener("resize", size);

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const seconds = Math.min(0.05, (now - previous) / 1000);
    previous = now;
    if (!watch.onScreen()) return;
    // The colours follow the theme, which can change under the picture.
    if (frames++ % 30 === 0) colours = coloursOf(host);
    if (playing) {
      beat += seconds;
      if (beat >= BEAT) {
        beat = 0;
        if (at >= last) setPlaying(false);
        else showCommit(at + 1);
      }
    }
    scene.step(seconds);
    size();
    context.setTransform(canvas.width / WIDTH, 0, 0, canvas.width / WIDTH, 0, 0);
    scene.draw(context, colours);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    watch.stop();
    stopFollowing();
    window.removeEventListener("resize", size);
  };
}
