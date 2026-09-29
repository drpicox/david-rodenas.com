import { el } from "../../../platform/browser/el";
import { watchOnScreen } from "../../../platform/browser/watchOnScreen";
import { escapeHtml } from "../../../platform/markdown/escapeHtml";
import type { App } from "../../../platform/plugin/Feature";
import type { Chosen } from "../detailsOf";
import type { Layout } from "../Layout";
import { layoutArchitecture } from "../layoutArchitecture";
import { type ColourLens, type LensChoice, lensesOf, type Pointing } from "../lensesOf";
import { metricsOf } from "../metricsOf";
import { pointedSaid } from "../pointedSaid";
import type { Sizing } from "../radiiBy";
import type { HistoryRead } from "../readHistory";
import { reachedByTests } from "../reachedByTests";
import { renderArchitectureCaption } from "../renderArchitectureCaption";
import { renderMetricsSparks } from "../renderMetricsSparks";
import { ArchitectureScene, type Colours, type Mode } from "./ArchitectureScene";
import { changesInBrowser } from "./changesInBrowser";
import { detailsPanel } from "./detailsPanel";
import type { shownCommit } from "./shownCommit";

const WIDTH = 1100;
/** How long each commit is shown while the history plays. */
const BEAT = 0.45;
const HINT = "Point at a file for what it brings out; click a file or a box for its details.";

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
 * arrows, and what pointing at a file brings out, said on a line above it
 * where the words cover none of it. A click chooses a file or a box, and the
 * panel beside the picture tells all about it, with a way to its code; with
 * nothing chosen, it tells the network. The still the build wrote is the last
 * commit, and it stands until the history has arrived.
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
  let chosen: Chosen = null;
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
  const status = el("p", { class: "architecture-status" }, HINT);
  // Every name in the panel is a way to its own details, as a click on the picture is.
  const panel = detailsPanel(read, counted, (next) => pick(next));
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
    panel.tell(at, chosen);
    sayStatus();
    said.textContent = lenses.said;
    caption.innerHTML = renderArchitectureCaption(commit, metrics[at] ?? metricsOf(snapshot));
    sparks.innerHTML = renderMetricsSparks(metrics, at);
  };
  const pathsAt = () => new Map((snapshots[at]?.modules ?? []).map((module) => [module.id, module.path]));
  const nameOfChosen = (one: NonNullable<Chosen>) => ("file" in one ? one.file : one.box);
  // The line above the picture: what is pointed at, and what it brings out; or what is chosen; or how to choose.
  const sayStatus = () => {
    const focused = scene.focused();
    const box = scene.hovered.path ? undefined : scene.hovered.box;
    const share = focused && !focused.test && !focused.typesOnly && at === coverageAt ? coverage?.get(focused.path) : undefined;
    const kept = chosen ? ` · <span class="architecture-chosen">chosen: click it again, or press Esc, to let it go</span>` : "";
    if (focused && (scene.hovered.path || (chosen && "file" in chosen))) status.innerHTML = pointedSaid(focused.path, choice.pointing, focused.pointed, pathsAt(), share) + (scene.hovered.path ? "" : kept);
    else if (box) status.innerHTML = `<code>${escapeHtml(box)}</code> · click for its details`;
    else if (chosen) status.innerHTML = `<code>${escapeHtml(nameOfChosen(chosen))}</code>${kept}`;
    else status.textContent = HINT;
  };
  const besideIt = () => getComputedStyle(stage).gridTemplateColumns.trim().split(/\s+/).length > 1;
  const pick = (next: Chosen, fromPicture = false) => {
    chosen = next;
    scene.selected = next === null ? {} : "file" in next ? { path: next.file } : { box: next.box };
    panel.tell(at, chosen, true);
    sayStatus();
    // Where the details stand under the picture, not beside it, a choice made on the picture brings them into view.
    if (fromPicture && next && !besideIt()) panel.element.scrollIntoView({ block: "start", behavior: still ? "auto" : "smooth" });
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
  // Following the page, the commit it moves to is shown when the picture is on screen: off it, nothing is worked out for nobody.
  let wanted = at;
  const stopFollowing = follow?.on((commit) => {
    wanted = commit ?? last;
  }) ?? (() => {});
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
    const was = canvas.dataset["hovered"];
    scene.hovered = scene.hit(x, y);
    canvas.style.cursor = scene.hovered.path || scene.hovered.box ? "pointer" : "";
    // What is under the pointer, said on the element too, for whoever reads the page without looking at it.
    canvas.dataset["hovered"] = scene.hovered.path ?? scene.hovered.box ?? "";
    if (canvas.dataset["hovered"] !== was) sayStatus();
  });
  canvas.addEventListener("mouseleave", () => {
    scene.hovered = {};
    canvas.dataset["hovered"] = "";
    sayStatus();
  });
  // A file, or a box, is chosen, and its details come beside the picture; chosen again, or nothing, and the network does.
  canvas.addEventListener("click", (event) => {
    const [x, y] = toScene(event);
    const hit = scene.hit(x, y);
    const next: Chosen = hit.path ? { file: hit.path } : hit.box ? { box: hit.box } : null;
    pick(next && chosen && nameOfChosen(next) === nameOfChosen(chosen) ? null : next, true);
  });
  const letGo = (event: KeyboardEvent) => {
    if (event.key === "Escape" && chosen) pick(null);
  };
  document.addEventListener("keydown", letGo);

  const stage = el("div", { class: "architecture-stage" }, el("div", { class: "architecture-view" }, status, canvas, said, legend), panel.element);
  host.replaceChildren(el("figure", { class: "architecture-figure" }, controls, lensControls, stage, caption, sparks));
  showCommit(at);
  panel.tell(at, chosen, true);
  const stopAll = () => {
    stopFollowing();
    panel.stop();
    document.removeEventListener("keydown", letGo);
  };

  const context = canvas.getContext("2d");
  if (!context) return stopAll;
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
    if (follow && wanted !== at) showCommit(wanted);
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
    stopAll();
    window.removeEventListener("resize", size);
  };
}
