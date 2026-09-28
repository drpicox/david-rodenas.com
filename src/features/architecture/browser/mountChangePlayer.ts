import { el } from "../../../platform/browser/el";
import { renderShownCommit } from "../renderShownCommit";
import { changesInBrowser } from "./changesInBrowser";
import { shownCommit } from "./shownCommit";

/** How long each commit is shown while the history plays: as long as the picture of the architecture holds one. */
const BEAT = 450;

/**
 * The page's player: a button to play the history, a slider to take it to
 * any commit, and the commit it stands at — every figure of the page follows
 * it. It stands above them and stays in sight while they are read. A page
 * arrived at shows the last commit.
 */
export function mountChangePlayer(host: HTMLElement): () => void {
  shownCommit.set(null);
  let commits: readonly { sha: string; date: string; subject: string }[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  let playing = false;

  const line = el("p", { class: "shown-commit" });
  line.innerHTML = host.querySelector(".shown-commit")?.innerHTML ?? "";
  const play = el("button", { type: "button" }, "▶ play the history");
  const slider = el("input", { type: "range", min: 0, max: 0, step: 1, value: 0, "aria-label": "The commit every figure below shows" });
  host.replaceChildren(el("div", { class: "change-player" }, play, slider, line));

  const last = () => commits.length - 1;
  const show = (at: number | null) => {
    const commit = at ?? last();
    slider.value = String(commit);
    line.innerHTML = renderShownCommit(commits, commit);
  };
  const setPlaying = (on: boolean) => {
    clearTimeout(timer);
    playing = on;
    play.textContent = on ? "❚❚ pause" : "▶ play the history";
    if (!on) return;
    if ((shownCommit.get() ?? last()) >= last()) shownCommit.set(0);
    const step = () => {
      timer = setTimeout(() => {
        const next = (shownCommit.get() ?? last()) + 1;
        shownCommit.set(next >= last() ? null : next);
        if (next >= last()) setPlaying(false);
        else step();
      }, BEAT);
    };
    step();
  };

  const stopListening = shownCommit.on(show);
  play.addEventListener("click", () => setPlaying(!playing));
  slider.addEventListener("input", () => {
    setPlaying(false);
    const at = Number(slider.value);
    shownCommit.set(at >= last() ? null : at);
  });

  let stopped = false;
  changesInBrowser()
    .then(({ read }) => {
      if (stopped) return;
      commits = read.history.commits;
      slider.max = String(last());
      show(shownCommit.get());
    })
    .catch(() => {
      // Without the history there is nothing to play: the line the build wrote stays.
      play.disabled = true;
      slider.disabled = true;
    });

  return () => {
    stopped = true;
    clearTimeout(timer);
    stopListening();
  };
}
