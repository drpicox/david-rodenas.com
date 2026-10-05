import { tag } from "../../../platform/blueprint/tag";
import type { BallLook } from "../renderArchitectureSvg";
import type { Snapshot } from "../Snapshot";

const round = (value: number) => Math.round(value * 10) / 10;

/** A graph drawn tangled: every arrow a faint thread, every node a ball where the tangle left it, as the look asks it to be. */
export function renderTangleSvg(snapshot: Snapshot, at: ReadonlyMap<number, { x: number; y: number }>, look: BallLook, width: number, height: number): string {
  const threads = snapshot.dependencies.flatMap(({ from, to }) => {
    const [a, b] = [at.get(from), at.get(to)];
    return a && b ? [tag("line", { class: "thread", x1: round(a.x), y1: round(a.y), x2: round(b.x), y2: round(b.y) })] : [];
  });
  const balls = snapshot.modules.map((module) => {
    const place = at.get(module.id) ?? { x: 0, y: 0 };
    const fill = look.fills?.get(module.id);
    return tag(
      "circle",
      { class: ["ball", module.test ? "test" : "", look.classes?.get(module.id) ?? ""].filter(Boolean).join(" "), "data-key": `ball:${module.path}`, cx: round(place.x), cy: round(place.y), r: round(look.radii?.get(module.id) ?? 3), style: fill ? `fill: ${fill}` : undefined },
      tag("title", {}, module.path),
    );
  });
  return tag("svg", { class: "architecture tangle", viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": `${snapshot.modules.length} nodes tangled by ${snapshot.dependencies.length} arrows` }, tag("g", { class: "threads" }, threads), tag("g", { class: "balls" }, balls)).html;
}
