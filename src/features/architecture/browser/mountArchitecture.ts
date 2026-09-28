import { el } from "../../../platform/browser/el";
import { watchOnScreen } from "../../../platform/browser/watchOnScreen";
import { decodeHistory } from "../decodeHistory";
import type { Coverage } from "../Coverage";
import type { History } from "../History";
import type { Layout } from "../Layout";
import { layoutArchitecture } from "../layoutArchitecture";
import { metricsOf } from "../metricsOf";
import { radiiBy, type Sizing } from "../radiiBy";
import { reachedByTests } from "../reachedByTests";
import { renderArchitectureCaption } from "../renderArchitectureCaption";
import { renderMetricsSparks } from "../renderMetricsSparks";
import { sourceUrlOf } from "../sourceUrlOf";
import { ArchitectureScene, type Colours, type Mode } from "./ArchitectureScene";

const WIDTH = 1100;
/** How long each commit is shown while the history plays. */
const BEAT = 0.45;

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
  };
}

/**
 * The architecture page's figure, made to move: the history of the source
 * played commit by commit, each file flying to where the next commit puts
 * it; the same source tangled, with no boxes, only the pull of what needs
 * what, and untangled again; and the tests put in, to see what they reach.
 * The still the build wrote is the last commit, and it stands until the
 * history has arrived.
 */
export function mountArchitecture(host: HTMLElement): () => void {
  let stopped = false;
  let stop = () => {
    stopped = true;
  };
  const coverage = fetch("/data/coverage.json")
    .then((response) => (response.ok ? (response.json() as Promise<Coverage>) : null))
    .catch(() => null);
  void fetch("/data/architecture.json")
    .then((response) => response.json() as Promise<History>)
    .then(async (history) => {
      const counted = await coverage;
      if (stopped) return;
      stop = play(host, history, counted);
    })
    .catch(() => {
      // Without the history the still stays, and it is the last commit already.
    });
  return () => stop();
}

function play(host: HTMLElement, history: History, counted: Coverage | null): () => void {
  // The lines the tests run were counted at one commit only; the pies are drawn there, and the rings everywhere else.
  const coverageAt = counted && history.commits.findIndex((commit) => commit.sha === counted.sha);
  const coverage = counted ? new Map(Object.entries(counted.lines)) : null;
  const snapshots = decodeHistory(history);
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

  let at = last;
  let tests = false;
  // A ball is as big as the files that need it: the ones a change in it reaches first.
  let sizing: Sizing = "neededBy";
  let mode: Mode = "boxes";
  let playing = false;
  let beat = 0;

  const canvas = el("canvas", { class: "architecture-canvas", "aria-label": "The source of this site: its files as balls, its folders as boxes, and arrows for what needs what" });
  const caption = el("figcaption");
  const sparks = el("div", { class: "sparks-host" });
  const slider = el("input", { type: "range", min: 0, max: last, step: 1, value: at, "aria-label": "Commit" });
  const playButton = el("button", { type: "button" }, "▶ play the history");
  const tangleButton = el("button", { type: "button" }, "tangle it");
  const testsBox = el("input", { type: "checkbox" });
  const option = (value: string, words: string, chosen = false) => el("option", { value, selected: chosen }, words);
  const sizeBox = el("select", { "aria-label": "What a ball's size says" }, option("neededBy", "needed by", true), option("needs", "needs"), option("lines", "lines"));
  const reachBox = el("select", { "aria-label": "How far a file's arrows reach" }, option("1", "1", true), option("2", "2"), option("3", "3"), option("Infinity", "all"));
  const controls = el(
    "div",
    { class: "architecture-controls" },
    playButton,
    tangleButton,
    el("label", {}, testsBox, " the tests"),
    el("label", {}, "size: ", sizeBox),
    el("label", {}, "reach: ", reachBox),
    slider,
  );
  // What the shapes mean, shown only while the tests are, since it is only then there is more than one.
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
    scene.show(snapshot, layoutAt(at, tests), {
      untangling,
      reached: tests ? reachedByTests(snapshot) : null,
      coverage: tests && at === coverageAt ? coverage : null,
      sizes: radiiBy(snapshot, sizing),
    });
    caption.innerHTML = renderArchitectureCaption(commit, metrics[at] ?? metricsOf(snapshot));
    sparks.innerHTML = renderMetricsSparks(metrics, at);
  };

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
  sizeBox.addEventListener("change", () => {
    sizing = sizeBox.value as Sizing;
    showCommit(at);
  });
  reachBox.addEventListener("change", () => {
    scene.reach = Number(reachBox.value);
  });
  slider.addEventListener("input", () => {
    setPlaying(false);
    showCommit(Number(slider.value));
  });
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
    if (Math.max(0, Math.min(last, commit)) !== at) showCommit(commit);
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

  host.replaceChildren(el("figure", { class: "architecture-figure" }, controls, canvas, legend, caption, sparks));
  showCommit(at);

  const context = canvas.getContext("2d");
  if (!context) return () => {};
  const watch = watchOnScreen(canvas);
  let colours = coloursOf(host);
  let frames = 0;
  let previous = performance.now();
  let frame = 0;

  // The canvas is as tall as the picture is now, and follows it: sized again only when it has moved by a pixel.
  let sizedAt = { width: 0, height: 0 };
  const size = () => {
    const ratio = window.devicePixelRatio || 1;
    const shown = canvas.clientWidth || WIDTH;
    const tall = Math.round((shown * scene.height) / WIDTH);
    if (shown === sizedAt.width && Math.abs(tall - sizedAt.height) < 1) return;
    sizedAt = { width: shown, height: tall };
    canvas.width = Math.round(shown * ratio);
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
    window.removeEventListener("resize", size);
  };
}
