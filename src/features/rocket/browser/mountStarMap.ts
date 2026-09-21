import { destinations } from "../destinations";
import { nearStars } from "../nearStars";
import { projectStars, type View } from "../projectStars";
import { saidTime } from "../saidTime";
import type { Ship } from "../Ship";
import { voyage } from "../voyage";
import { whereAt } from "../whereAt";

/** Light-years from the Sun to the edge of the map. */
const REACH = 12.5;
/** Seconds of the reader's time a trip takes to play, whatever it takes the ship, and the rest at each end. */
const PLAY = 9;
const REST = 1.5;
/** Space is dark whatever the page's theme is: these are the map's own colours. */
/** Alpha Centauri is a fifth of a light-year from Proxima: at this scale they are one dot, and one name is enough. */
const UNNAMED = new Set(["Alpha Centauri"]);
const INK = { ground: "#06080f", ring: "rgba(127,166,234,0.22)", stem: "rgba(127,166,234,0.18)", star: "#dfe7f5", dim: "#7d8aa3", sun: "#ffd98a", way: "#ff9d6e", ship: "#ffffff" };

export interface Course {
  readonly ship: Ship;
  readonly chosen: string;
}

/**
 * The neighbourhood, turning: the stars within twelve light-years, each on a
 * stem down to the plane of the celestial equator so the eye can tell above
 * from below, and the ship flying the chosen trip over and over with its two
 * clocks beside it. Drag to turn it. A star that is also a row of the table
 * can be pressed.
 *
 * It is the one part of the page that is only a picture: everything it shows
 * is in the table under it, which is why the table is what the build writes.
 */
export function mountStarMap(canvas: HTMLCanvasElement, course: () => Course, choose: (name: string) => void): () => void {
  // No canvas to draw on — a test's browser, or a reader's — and the whole of the table is still there.
  const maybe = canvas.getContext("2d");
  if (!maybe) return () => {};
  const context: CanvasRenderingContext2D = maybe;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reachable = new Set(destinations.map(({ name }) => name));

  let view: View = { yaw: 0.6, pitch: 0.45, radius: 1, reach: REACH };
  let frame = 0;
  let began = performance.now();
  let dragging: { x: number; y: number } | null = null;
  let seen: ReturnType<typeof projectStars> = [];

  const middle = () => ({ x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 });

  function draw(now: number): void {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = INK.ground;
    context.fillRect(0, 0, width, height);

    if (!still && !dragging) view = { ...view, yaw: view.yaw + 0.0015 };
    // The whole sphere has to fit whichever way it is turned, so the shorter side decides.
    view = { ...view, radius: Math.min(width, height) * 0.47 };
    const centre = middle();
    const at = (point: { x: number; y: number }) => ({ x: centre.x + point.x, y: centre.y + point.y });
    context.font = "11px ui-monospace, Menlo, monospace";

    // The plane of the equator, as two rings: five and ten light-years.
    for (const lightYears of [5, 10]) {
      const ring = projectStars(Array.from({ length: 73 }, (_, step) => ({ name: "", ra: (step / 72) * 24, dec: 0, lightYears })), view);
      context.beginPath();
      ring.forEach((point, index) => (index ? context.lineTo(at(point).x, at(point).y) : context.moveTo(at(point).x, at(point).y)));
      context.strokeStyle = INK.ring;
      context.stroke();
      const label = at(ring[0] ?? { x: 0, y: 0 });
      context.fillStyle = INK.dim;
      context.fillText(`${lightYears} ly`, label.x + 4, label.y - 3);
    }

    const { ship, chosen } = course();
    const destination = destinations.find(({ name }) => name === chosen);
    const star = nearStars.find(({ name }) => name === chosen);
    const trip = destination ? voyage(destination.metres, ship) : null;

    // Far ones first, so the near ones are drawn over them.
    seen = projectStars(nearStars, view);
    const feet = projectStars(nearStars.map((one) => ({ ...one, lightYears: one.lightYears * Math.cos((one.dec / 180) * Math.PI), dec: 0 })), view);
    const order = seen.map((_, index) => index).sort((a, b) => (seen[a]?.depth ?? 0) - (seen[b]?.depth ?? 0));
    for (const index of order) {
      const point = at(seen[index] ?? { x: 0, y: 0 });
      const foot = at(feet[index] ?? { x: 0, y: 0 });
      const name = seen[index]?.name ?? "";
      const near = ((seen[index]?.depth ?? 0) + REACH) / (2 * REACH);
      context.strokeStyle = INK.stem;
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(foot.x, foot.y);
      context.stroke();
      context.fillStyle = name === chosen ? INK.way : INK.star;
      context.globalAlpha = 0.45 + 0.55 * near;
      context.beginPath();
      context.arc(point.x, point.y, 1.6 + 1.8 * near, 0, 2 * Math.PI);
      context.fill();
      if (reachable.has(name)) {
        context.strokeStyle = name === chosen ? INK.way : INK.dim;
        context.beginPath();
        context.arc(point.x, point.y, 7, 0, 2 * Math.PI);
        context.stroke();
      }
      context.fillStyle = name === chosen ? INK.way : INK.dim;
      if (!UNNAMED.has(name)) context.fillText(name, point.x + 10, point.y + 4);
      context.globalAlpha = 1;
    }

    context.fillStyle = INK.sun;
    context.beginPath();
    context.arc(centre.x, centre.y, 4, 0, 2 * Math.PI);
    context.fill();
    context.fillText("the Sun", centre.x + 8, centre.y - 6);

    if (trip && destination) {
      // Where the trip ends on the picture: at its star, or at the edge of the map towards what is far beyond it.
      const far = destination.towards ? projectStars([{ name: "", ...destination.towards, lightYears: REACH * 1.15 }], view)[0] : null;
      const end = star ? seen[nearStars.indexOf(star)] : far;
      const elapsed = ((now - began) / 1000) % (PLAY + 2 * REST);
      const played = still ? 0.5 : Math.min(1, Math.max(0, (elapsed - REST) / PLAY));
      const moment = whereAt(trip, ship, played * trip.shipTime);

      if (end) {
        const target = at(end);
        context.strokeStyle = INK.way;
        context.setLineDash(star ? [] : [4, 4]);
        context.beginPath();
        context.moveTo(centre.x, centre.y);
        context.lineTo(target.x, target.y);
        context.stroke();
        context.setLineDash([]);
        const shipAt = { x: centre.x + (target.x - centre.x) * moment.along, y: centre.y + (target.y - centre.y) * moment.along };
        context.fillStyle = INK.ship;
        context.beginPath();
        context.arc(shipAt.x, shipAt.y, 3, 0, 2 * Math.PI);
        context.fill();
        if (!star) context.fillText(`to ${destination.name}, ${destination.said}: not to scale`, 12, height - 34);
      } else {
        context.fillStyle = INK.dim;
        context.fillText(`${destination.name} is inside the dot: the planets are a thousandth of a light-year away`, 12, height - 34);
      }

      context.fillStyle = INK.star;
      context.font = "13px ui-monospace, Menlo, monospace";
      context.fillText(`on board ${saidTime(played * trip.shipTime)}`, 12, 22);
      context.fillText(`at home  ${saidTime(moment.homeTime)}`, 12, 40);
      context.fillStyle = INK.dim;
      context.fillText(`${(moment.speed * 100).toFixed(moment.speed > 0.99 ? 4 : 1)}% of c`, 12, 58);
      context.fillText("drag to turn", width - 96, height - 14);
    }

    frame = still && !dragging ? 0 : requestAnimationFrame(draw);
  }

  const pointerAt = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };
  const onDown = (event: PointerEvent) => {
    dragging = pointerAt(event);
    canvas.setPointerCapture(event.pointerId);
    if (!frame) frame = requestAnimationFrame(draw);
  };
  const onMove = (event: PointerEvent) => {
    if (!dragging) return;
    const here = pointerAt(event);
    view = { ...view, yaw: view.yaw + (here.x - dragging.x) * 0.01, pitch: Math.max(-1.4, Math.min(1.4, view.pitch + (here.y - dragging.y) * 0.01)) };
    dragging = here;
  };
  const onUp = (event: PointerEvent) => {
    const here = pointerAt(event);
    const centre = middle();
    const pressed = seen.find((star) => reachable.has(star.name) && Math.hypot(centre.x + star.x - here.x, centre.y + star.y - here.y) < 12);
    dragging = null;
    if (pressed) {
      began = performance.now();
      choose(pressed.name);
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  frame = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(frame);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
  };
}
