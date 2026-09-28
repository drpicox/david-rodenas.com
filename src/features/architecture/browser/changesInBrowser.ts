import type { Coverage } from "../Coverage";
import { readHistory, type HistoryRead } from "../readHistory";

export interface ChangesLoaded {
  readonly read: HistoryRead;
  readonly coverage: Coverage | null;
}

let loading: Promise<ChangesLoaded> | undefined;

/**
 * The history, and the lines the tests run, fetched once for every figure of
 * the page on how the source changes and kept while the reader stays on the
 * site. A failed fetch is forgotten, so that the next page to ask tries again.
 */
export function changesInBrowser(): Promise<ChangesLoaded> {
  loading ??= Promise.all([
    fetch("/data/architecture.json").then((response) => {
      if (!response.ok) throw new Error(`the history: ${response.status}`);
      return response.text();
    }),
    fetch("/data/coverage.json")
      .then((response) => (response.ok ? (response.json() as Promise<Coverage>) : null))
      .catch(() => null),
  ])
    .then(([text, coverage]) => ({ read: readHistory(text), coverage }))
    .catch((error: unknown) => {
      loading = undefined;
      throw error;
    });
  return loading;
}
