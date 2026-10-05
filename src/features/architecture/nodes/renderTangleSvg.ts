import { tag } from "../../../platform/blueprint/tag";
import type { BallLook } from "../renderArchitectureSvg";
import type { Snapshot } from "../Snapshot";

const round = (value: number) => Math.round(value * 10) / 10;

/** A graph drawn tangled: every arrow a faint thread, every node a ball where the tangle left it, as the look asks it to be. */
export function renderTangleSvg(snapshot: Snapshot, at: ReadonlyMap<number, { x: number; y: number }>, look: BallLook, width: number, height: number): string {
  // Every thread in one path: a thousand of them as elements would weigh more than the picture says.
  const threads = snapshot.dependencies
    .flatMap(({ from, to }) => {
      const [a, b] = [at.get(from), at.get(to)];
      return a && b ? [`M${round(a.x)} ${round(a.y)}L${round(b.x)} ${round(b.y)}`] : [];
    })
    .join("");
  const balls = snapshot.modules.map((module) => {
    const place = at.get(module.id) ?? { x: 0, y: 0 };
    const fill = look.fills?.get(module.id);
    return tag(
      "circle",
      { class: ["ball", module.test ? "test" : "", look.classes?.get(module.id) ?? ""].filter(Boolean).join(" "), cx: round(place.x), cy: round(place.y), r: round(look.radii?.get(module.id) ?? 3), style: fill ? `fill: ${fill}` : undefined },
      tag("title", {}, module.path),
    );
  });
  return tag("svg", { class: "architecture tangle", viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": `${snapshot.modules.length} nodes tangled by ${snapshot.dependencies.length} arrows` }, tag("path", { class: "thread", d: threads }), tag("g", { class: "balls" }, balls)).html;
}
