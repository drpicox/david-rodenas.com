import type { Body } from "../Body";
import type { Layout } from "../Layout";
import type { Snapshot } from "../Snapshot";
import { springTowards } from "../springTowards";
import { tangleStep } from "../tangleStep";

export type Mode = "boxes" | "tangle";

export interface Colours {
  readonly ink: string;
  readonly dim: string;
  readonly rule: string;
  readonly sunken: string;
  readonly accent: string;
  readonly soft: string;
  readonly warn: string;
}

interface Ball {
  readonly body: Body;
  /** The radius, flying on a spring of its own, which is what makes a new file pop in. */
  readonly size: Body;
  radius: number;
  alpha: number;
  leaving: boolean;
  box: string;
  path: string;
  test: boolean;
  typesOnly: boolean;
  /** Seconds to wait before flying, so an untangling falls into place from the top down. */
  wait: number;
  trail: { x: number; y: number }[];
  bornAt: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Box extends Rect {
  target: Rect;
  label: string;
  alpha: number;
  leaving: boolean;
  cyclic: boolean;
}

/** The tangle needs room to spread whatever the boxes would take. */
const TANGLE_HEIGHT = 760;
/** How far a ball has to be flying, in a second, before it leaves a trail. */
const TRAIL_SPEED = 260;
const TRAIL_LENGTH = 10;

const ease = (from: number, to: number, seconds: number, rate = 8) => from + (to - from) * (1 - Math.exp(-rate * seconds));
const tween = (rect: Rect, target: Rect, seconds: number) => {
  rect.x = ease(rect.x, target.x, seconds);
  rect.y = ease(rect.y, target.y, seconds);
  rect.width = ease(rect.width, target.width, seconds);
  rect.height = ease(rect.height, target.height, seconds);
};

/**
 * The source as it moves: balls for files, boxes for folders, arrows for what
 * needs what. It is told a snapshot, its layout and a mode, and flies
 * everything from where it is to where it should be. Nothing here decides
 * where anything goes — the layout did — only how it gets there.
 */
export class ArchitectureScene {
  private readonly balls = new Map<number, Ball & { id: number }>();
  private readonly boxes = new Map<string, Box>();
  private readonly bands = new Map<string, Box>();
  private layout: Layout | null = null;
  private mode: Mode = "boxes";
  private time = 0;
  private boxAlpha = 1;
  /** The file-level arrows, drawn in the tangle, where there are no boxes to gather them. */
  private fileLinks: [number, number][] = [];
  hovered: { path?: string; box?: string } = {};

  /** How tall the picture is now: it follows the snapshot, and the tangle, as they grow and shrink. */
  height = TANGLE_HEIGHT;

  constructor(
    private readonly width: number,
    private readonly still: boolean,
  ) {}

  private get wanted(): number {
    const boxes = this.layout?.height ?? TANGLE_HEIGHT;
    return this.mode === "tangle" ? Math.max(boxes, TANGLE_HEIGHT) : boxes;
  }

  /** When the tests are shown, the files no test reaches directly are drawn hollow. */
  private reached: ReadonlySet<number> | null = null;

  show(snapshot: Snapshot, layout: Layout, { untangling = false, reached = null }: { untangling?: boolean; reached?: ReadonlySet<number> | null } = {}): void {
    this.reached = reached;
    this.layout = layout;
    if (this.still || this.balls.size === 0) this.height = this.wanted;
    const topRank = Math.max(0, ...layout.boxes.map((box) => box.rank));
    const rankOf = new Map(layout.boxes.map((box) => [box.name, box.rank]));
    const visible = new Set<number>();
    for (const place of layout.balls) {
      visible.add(place.id);
      const ball = this.balls.get(place.id);
      const wait = untangling ? (topRank - (rankOf.get(place.box) ?? 0)) * 0.07 + Math.random() * 0.12 : 0;
      if (ball) {
        Object.assign(ball, { leaving: false, box: place.box, path: place.path, test: place.test, typesOnly: place.typesOnly, radius: place.radius, wait });
      } else {
        // A new file is born where it will stand, from nothing, unless the tangle is showing: then anywhere near the middle.
        const [x, y] = this.mode === "tangle" ? [this.width / 2 + (Math.random() - 0.5) * 80, this.height / 2 + (Math.random() - 0.5) * 80] : [place.x, place.y];
        this.balls.set(place.id, {
          id: place.id,
          body: { x, y, vx: 0, vy: 0 },
          size: { x: this.still ? place.radius : 0, y: 0, vx: 0, vy: 0 },
          radius: place.radius,
          alpha: this.still ? 1 : 0,
          leaving: false,
          box: place.box,
          path: place.path,
          test: place.test,
          typesOnly: place.typesOnly,
          wait,
          trail: [],
          bornAt: this.time,
        });
      }
    }
    for (const [id, ball] of this.balls) if (!visible.has(id)) ball.leaving = true;

    const keep = (store: Map<string, Box>, places: readonly (Rect & { name: string; label?: string; cyclic?: boolean })[]) => {
      const named = new Set(places.map((place) => place.name));
      for (const place of places) {
        const target = { x: place.x, y: place.y, width: place.width, height: place.height };
        const box = store.get(place.name);
        if (box) Object.assign(box, { target, leaving: false, cyclic: place.cyclic ?? false, label: place.label ?? place.name });
        else store.set(place.name, { ...target, target, label: place.label ?? place.name, alpha: this.still ? 1 : 0, leaving: false, cyclic: place.cyclic ?? false });
      }
      for (const [name, box] of store) if (!named.has(name)) box.leaving = true;
    };
    keep(this.boxes, layout.boxes);
    keep(this.bands, layout.bands);

    const index = new Map(layout.balls.map((ball, at) => [ball.id, at]));
    this.fileLinks = snapshot.dependencies.flatMap(({ from, to }) => (index.has(from) && index.has(to) ? [[from, to] as [number, number]] : []));
  }

  setMode(mode: Mode): void {
    this.mode = mode;
  }

  step(seconds: number): void {
    this.time += seconds;
    this.height = this.still ? this.wanted : ease(this.height, this.wanted, seconds, 6);
    const places = new Map(this.layout?.balls.map((ball) => [ball.id, ball]) ?? []);
    this.boxAlpha = ease(this.boxAlpha, this.mode === "boxes" ? 1 : 0, seconds, 5);

    if (this.mode === "tangle") {
      const live = [...this.balls.entries()].filter(([, ball]) => !ball.leaving);
      const at = new Map(live.map(([id], position) => [id, position]));
      const links = this.fileLinks.flatMap(([from, to]) => {
        const [a, b] = [at.get(from), at.get(to)];
        return a !== undefined && b !== undefined ? [[a, b] as [number, number]] : [];
      });
      tangleStep(
        live.map(([, ball]) => ball.body),
        links,
        { width: this.width, height: this.height },
      );
    }

    for (const [id, ball] of this.balls) {
      const place = places.get(id);
      if (this.mode === "boxes" && place) {
        if (ball.wait > 0) ball.wait -= seconds;
        else if (this.still) Object.assign(ball.body, { x: place.x, y: place.y, vx: 0, vy: 0 });
        else springTowards(ball.body, place.x, place.y, seconds);
      }
      springTowards(ball.size, ball.leaving ? 0 : ball.radius, 0, seconds);
      ball.alpha = ease(ball.alpha, ball.leaving ? 0 : 1, seconds, 6);
      const speed = Math.hypot(ball.body.vx, ball.body.vy);
      if (speed > TRAIL_SPEED && this.mode === "boxes") ball.trail.push({ x: ball.body.x, y: ball.body.y });
      if (ball.trail.length > TRAIL_LENGTH || (speed < TRAIL_SPEED && ball.trail.length)) ball.trail.shift();
      if (ball.leaving && ball.alpha < 0.02) this.balls.delete(id);
    }

    for (const store of [this.boxes, this.bands]) {
      for (const [name, box] of store) {
        if (this.still) Object.assign(box, box.target);
        else tween(box, box.target, seconds);
        box.alpha = ease(box.alpha, box.leaving ? 0 : 1, seconds, 6);
        if (box.leaving && box.alpha < 0.02) store.delete(name);
      }
    }
  }

  /** The file under a point, or the box, in the scene's own units. */
  hit(x: number, y: number): { path?: string; box?: string } {
    for (const ball of this.balls.values()) if (Math.hypot(ball.body.x - x, ball.body.y - y) <= Math.max(5, ball.size.x + 2)) return { path: ball.path, box: ball.box };
    if (this.mode === "boxes") for (const [name, box] of this.boxes) if (x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height) return { box: name };
    return {};
  }

  draw(context: CanvasRenderingContext2D, colours: Colours): void {
    context.clearRect(0, 0, this.width, this.height);
    context.lineCap = "round";
    const pulse = 0.5 + 0.5 * Math.sin(this.time * 4);

    // The boxes, and the bands round them, fading with the mode.
    context.font = `bold 10px ui-monospace, Menlo, monospace`;
    for (const band of this.bands.values()) {
      context.globalAlpha = band.alpha * this.boxAlpha * 0.9;
      context.setLineDash([2, 4]);
      context.strokeStyle = colours.rule;
      context.lineWidth = 1;
      context.beginPath();
      context.roundRect(band.x, band.y, band.width, band.height, 6);
      context.stroke();
      context.setLineDash([]);
      context.fillStyle = colours.dim;
      context.fillText(band.label, band.x + 8, band.y + 12);
    }
    context.font = `9px ui-monospace, Menlo, monospace`;
    for (const [name, box] of this.boxes) {
      const lit = this.hovered.box === name;
      context.globalAlpha = box.alpha * this.boxAlpha;
      context.fillStyle = colours.sunken;
      context.strokeStyle = box.cyclic ? colours.warn : lit ? colours.accent : colours.rule;
      context.lineWidth = box.cyclic ? 1.5 + pulse * 1.5 : lit ? 1.5 : 1;
      if (box.cyclic) {
        context.shadowColor = colours.warn;
        context.shadowBlur = 6 + pulse * 10;
      }
      context.beginPath();
      context.roundRect(box.x, box.y, box.width, box.height, 4);
      context.fill();
      context.stroke();
      context.shadowBlur = 0;
      context.fillStyle = lit ? colours.accent : colours.dim;
      context.fillText(box.label, box.x + 6, box.y + 10);
    }

    // A file under the pointer brings its own arrows, and everything it is not tied to steps back.
    const focus = this.hovered.path ? [...this.balls.values()].find((ball) => ball.path === this.hovered.path) : undefined;
    const needs = focus ? this.fileLinks.filter(([from]) => from === focus.id).map(([, to]) => to) : [];
    const neededBy = focus ? this.fileLinks.filter(([, to]) => to === focus.id).map(([from]) => from) : [];
    const tied = new Set([...(focus ? [focus.id] : []), ...needs, ...neededBy]);

    this.drawLinks(context, colours, focus !== undefined);
    if (focus) this.drawFileArrows(context, colours, focus, needs, neededBy);

    // The balls last, over everything, with the trail of any that is flying across the picture.
    for (const ball of this.balls.values()) {
      const radius = Math.max(0, ball.size.x);
      if (ball.trail.length > 1) {
        context.strokeStyle = colours.accent;
        for (let at = 1; at < ball.trail.length; at += 1) {
          context.globalAlpha = (at / ball.trail.length) * 0.35 * ball.alpha;
          context.lineWidth = radius * (at / ball.trail.length) * 1.4;
          context.beginPath();
          context.moveTo(ball.trail[at - 1]!.x, ball.trail[at - 1]!.y);
          context.lineTo(ball.trail[at]!.x, ball.trail[at]!.y);
          context.stroke();
        }
      }
      const age = this.time - ball.bornAt;
      if (age < 0.8 && !this.still) {
        // The ring a new file is born with, spreading and fading.
        context.globalAlpha = (1 - age / 0.8) * 0.6;
        context.strokeStyle = colours.accent;
        context.lineWidth = 1.2;
        context.beginPath();
        context.arc(ball.body.x, ball.body.y, radius + age * 22, 0, Math.PI * 2);
        context.stroke();
      }
      const lit = this.hovered.path === ball.path;
      const backed = focus !== undefined && !tied.has(ball.id);
      const untested = this.reached !== null && !ball.test && !ball.typesOnly && !this.reached.has(ball.id);
      context.globalAlpha = ball.alpha * (backed ? 0.22 : 1);
      context.beginPath();
      context.arc(ball.body.x, ball.body.y, lit ? radius + 2 : Math.max(0, untested ? radius - 0.6 : radius), 0, Math.PI * 2);
      if (untested) {
        context.strokeStyle = colours.warn;
        context.lineWidth = 1.2;
        context.stroke();
      } else {
        context.fillStyle = ball.test ? colours.soft : colours.accent;
        context.fill();
      }
      if (lit) {
        context.strokeStyle = colours.ink;
        context.lineWidth = 1.5;
        context.stroke();
      }
    }

    if (focus) this.label(context, colours, `${focus.path}   needs ${needs.length} · needed by ${neededBy.length}`, focus.body.x, focus.body.y - 10);
    context.globalAlpha = 1;
  }

  /** One file's own arrows: out to what it needs, in from what needs it, each with its head at the ball it points to. */
  private drawFileArrows(context: CanvasRenderingContext2D, colours: Colours, focus: Ball, needs: readonly number[], neededBy: readonly number[]): void {
    const arrow = (from: Ball, to: Ball, colour: string, alpha: number) => {
      const [dx, dy] = [to.body.x - from.body.x, to.body.y - from.body.y];
      const length = Math.hypot(dx, dy) || 1;
      const [ux, uy] = [dx / length, dy / length];
      const end = { x: to.body.x - ux * (to.size.x + 2), y: to.body.y - uy * (to.size.x + 2) };
      // A slight bow, always to the same side, so an arrow there and one back do not lie on each other.
      const control = { x: (from.body.x + end.x) / 2 - uy * length * 0.12, y: (from.body.y + end.y) / 2 + ux * length * 0.12 };
      context.globalAlpha = alpha;
      context.strokeStyle = colour;
      context.fillStyle = colour;
      context.lineWidth = 1.4;
      context.beginPath();
      context.moveTo(from.body.x, from.body.y);
      context.quadraticCurveTo(control.x, control.y, end.x, end.y);
      context.stroke();
      const [hx, hy] = [end.x - control.x, end.y - control.y];
      const angle = Math.atan2(hy, hx);
      context.beginPath();
      context.moveTo(end.x, end.y);
      context.lineTo(end.x - 7 * Math.cos(angle - 0.4), end.y - 7 * Math.sin(angle - 0.4));
      context.lineTo(end.x - 7 * Math.cos(angle + 0.4), end.y - 7 * Math.sin(angle + 0.4));
      context.closePath();
      context.fill();
    };
    for (const id of needs) {
      const to = this.balls.get(id);
      if (to) arrow(focus, to, colours.accent, 0.9);
    }
    for (const id of neededBy) {
      const from = this.balls.get(id);
      if (from) arrow(from, focus, colours.soft, 0.75);
    }
  }

  private drawLinks(context: CanvasRenderingContext2D, colours: Colours, stepBack: boolean): void {
    // In the tangle every file needs every file it needs, one thread each: the spaghetti.
    if (this.boxAlpha < 0.98) {
      context.globalAlpha = (1 - this.boxAlpha) * 0.22;
      context.strokeStyle = colours.accent;
      context.lineWidth = 0.7;
      context.beginPath();
      for (const [from, to] of this.fileLinks) {
        const [a, b] = [this.balls.get(from), this.balls.get(to)];
        if (!a || !b) continue;
        context.moveTo(a.body.x, a.body.y);
        context.lineTo(b.body.x, b.body.y);
      }
      context.stroke();
    }
    if (!this.layout || this.boxAlpha < 0.02) return;

    // With boxes, one arrow a pair of boxes, riding on the boxes as they move.
    const hovered = this.hovered.box;
    for (const link of this.layout.links) {
      const [from, to] = [this.boxes.get(link.from), this.boxes.get(link.to)];
      const [target, source] = [this.layout.boxes.find((box) => box.name === link.to), this.layout.boxes.find((box) => box.name === link.from)];
      if (!from || !to || !target || !source) continue;
      const x1 = from.x + ((link.x1 - source.x) / source.width) * from.width;
      const y1 = from.y + from.height;
      const x2 = to.x + ((link.x2 - target.x) / target.width) * to.width;
      const y2 = to.y;
      const lit = hovered !== undefined && (link.from === hovered || link.to === hovered);
      const faded = hovered !== undefined && !lit;
      context.globalAlpha = this.boxAlpha * Math.min(from.alpha, to.alpha) * (stepBack ? 0.06 : lit ? 0.95 : faded ? 0.08 : 0.4);
      context.strokeStyle = lit ? colours.accent : colours.soft;
      context.lineWidth = Math.min(4, 0.8 + Math.log2(link.count) * 0.7) * (lit ? 1.4 : 1);
      context.setLineDash(link.typeOnly ? [4, 3] : []);
      const bend = Math.max(18, (y2 - y1) / 2);
      context.beginPath();
      context.moveTo(x1, y1);
      context.bezierCurveTo(x1, y1 + bend, x2, y2 - bend, x2, y2 - 4);
      context.stroke();
      context.setLineDash([]);
      // The head: arrows always have one, pointing at what is needed.
      context.fillStyle = context.strokeStyle;
      context.beginPath();
      context.moveTo(x2, y2);
      context.lineTo(x2 - 3.5, y2 - 7);
      context.lineTo(x2 + 3.5, y2 - 7);
      context.closePath();
      context.fill();
    }
  }

  private label(context: CanvasRenderingContext2D, colours: Colours, text: string, x: number, y: number): void {
    context.font = `11px ui-monospace, Menlo, monospace`;
    const width = context.measureText(text).width + 12;
    const left = Math.min(this.width - width - 4, Math.max(4, x - width / 2));
    context.globalAlpha = 0.95;
    context.fillStyle = colours.ink;
    context.beginPath();
    context.roundRect(left, y - 18, width, 18, 4);
    context.fill();
    context.fillStyle = colours.sunken;
    context.fillText(text, left + 6, y - 5);
  }
}
