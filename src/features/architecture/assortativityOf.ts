import type { Snapshot } from "./Snapshot";
import { undirectedOf } from "./undirectedOf";

/**
 * Whether files with many neighbours are joined to files with many, or with
 * few, the arrows read either way: the correlation of the degrees at the two
 * ends of every link (Newman, 2002). Near -1, the busy files are joined to
 * quiet ones — hubs and spokes; near 1, busy to busy and quiet to quiet.
 */
export function assortativityOf(snapshot: Snapshot): number {
  const { ids, weights } = undirectedOf(snapshot);
  const degree = new Map(ids.map((id) => [id, weights.get(id)?.size ?? 0]));
  let [links, product, half, squares] = [0, 0, 0, 0];
  for (const a of ids)
    for (const b of weights.get(a)?.keys() ?? []) {
      if (b < a) continue;
      const [j, k] = [degree.get(a) ?? 0, degree.get(b) ?? 0];
      links += 1;
      product += j * k;
      half += (j + k) / 2;
      squares += (j * j + k * k) / 2;
    }
  if (links === 0) return 0;
  const mean = half / links;
  const spread = squares / links - mean * mean;
  return spread > 0 ? (product / links - mean * mean) / spread : 0;
}
