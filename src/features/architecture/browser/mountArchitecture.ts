import { el } from "../../../platform/browser/el";
import { watchOnScreen } from "../../../platform/browser/watchOnScreen";
import { decodeHistory } from "../decodeHistory";
import type { Coverage } from "../Coverage";
import type { History } from "../History";
import type { Layout } from "../Layout";
import { layoutArchitecture } from "../layoutArchitecture";
import { metricsOf } from "../metricsOf";
import { reachedByTests } from "../reachedByTests";
import { renderArchitectureCaption } from "../renderArchitectureCaption";
import { renderMetricsSparks } from "../renderMetricsSparks";
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
  const controls = el("div", { class: "architecture-controls" }, playButton, tangleButton, el("label", {}, testsBox, " the tests, and the files none of them reaches"), slider);

  const showCommit = (next: number, untangling = false) => {
    at = Math.max(0, Math.min(last, next));
    slider.value = String(at);
    const snapshot = snapshots[at];
    const commit = history.commits[at];
    if (!snapshot || !commit) return;
    scene.show(snapshot, layoutAt(at, tests), { untangling, reached: tests ? reachedByTests(snapshot) : null, coverage: tests && at === coverageAt ? coverage : null });
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
    showCommit(at);
  });
  slider.addEventListener("input", () => {
    setPlaying(false);
    showCommit(Number(slider.value));
  });
  sparks.addEventListener("click", (event) => {
    const box = sparks.getBoundingClientRect();
    setPlaying(false);
    showCommit(Math.round(((event.clientX - box.left) / box.width) * last));
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

  host.replaceChildren(el("figure", { class: "architecture-figure" }, controls, canvas, caption, sparks));
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
