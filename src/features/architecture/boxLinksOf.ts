import { boxOf } from "./boxOf";
import type { BoxLink } from "./Layout";
import type { Snapshot } from "./Snapshot";

/** All the arrows from one box to another as one, as many as the arrows between their files, onto a type only if every one of them is; the tests' arrows only when `tests` are in. */
export function boxLinksOf(snapshot: Snapshot, tests = false): BoxLink[] {
  const boxOfId = new Map(snapshot.modules.filter((module) => tests || !module.test).map((module) => [module.id, boxOf(module.path)]));
  const linkOf = new Map<string, BoxLink>();
  for (const { from, to, typeOnly } of snapshot.dependencies) {
    const [a, b] = [boxOfId.get(from), boxOfId.get(to)];
    if (a === undefined || b === undefined || a === b) continue;
    const link = linkOf.get(`${a}>${b}`) ?? { from: a, to: b, count: 0, typeOnly: true };
    linkOf.set(`${a}>${b}`, { ...link, count: link.count + 1, typeOnly: link.typeOnly && typeOnly });
  }
  return [...linkOf.values()].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
}
