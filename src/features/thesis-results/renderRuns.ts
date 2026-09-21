import type { Run } from "./graphMatchingRuns";

const NAMES = { pairs: (graphs: number) => `Matching every pair of ${graphs} graphs`, "common-labelling": (graphs: number) => `Finding one labelling common to ${graphs} graphs` };

/** Seconds the way a person says them: the two largest units that matter. */
function said(seconds: number): string {
  if (seconds < 10) return `${seconds.toFixed(1)} s`;
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes < 10 ? `${minutes} min ${Math.round(seconds - minutes * 60)} s` : `${Math.round(seconds / 60)} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

const times = (factor: number) => `×${factor >= 10 ? Math.round(factor) : factor.toFixed(1)}`;

/**
 * One row for each size of graph: the three times, and how many times faster
 * than one thread the other two were, as bars on a single scale — the longest
 * bar on the page is the largest speed-up on the page.
 */
export function renderRuns(runs: readonly Run[]): string {
  const top = Math.max(...runs.map((run) => run.serial / run.cuda));
  const bar = (factor: number, kind: string) => `<span class="bar ${kind}" style="--p:${(factor / top).toFixed(3)}"></span><span class="factor">${times(factor)}</span>`;

  const groups = [...new Set(runs.map((run) => run.algorithm))].map((algorithm) => {
    const ofIt = runs.filter((run) => run.algorithm === algorithm);
    const rows = ofIt
      .map(
        (run) =>
          `<tr><th scope="row">${run.vertices} vertices</th><td>${said(run.serial)}</td>` +
          `<td>${said(run.openmp)}<div class="speedup">${bar(run.serial / run.openmp, "openmp")}</div></td>` +
          `<td>${said(run.cuda)}<div class="speedup">${bar(run.serial / run.cuda, "cuda")}</div></td></tr>`,
      )
      .join("");
    return `<tbody><tr class="group"><th colspan="4">${NAMES[algorithm](ofIt[0]?.graphs ?? 0)}</th></tr>${rows}</tbody>`;
  });

  return (
    `<figure class="runs"><table class="runs"><thead><tr><th>each graph has</th><th>one thread</th><th>OpenMP, 2 cores · 8 W</th><th>CUDA, 16 cores · 10 W</th></tr></thead>${groups.join("")}</table>` +
    `<figcaption>Measured in 2011 on an Intel Atom 330 with an NVIDIA 9400M beside it, on graphs of the GREC dataset. The bars are how many times faster than one thread, all on one scale.</figcaption></figure>`
  );
}
