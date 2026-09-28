import { againstStabilityOf } from "./againstStabilityOf";
import { boxLinksOf } from "./boxLinksOf";
import { boxOf } from "./boxOf";
import { cascadeFrom } from "./cascadeFrom";
import { changesUpTo } from "./changesUpTo";
import { groundOf } from "./groundOf";
import { heatOf } from "./heatOf";
import { historyUpTo } from "./historyUpTo";
import { measuresOf } from "./measuresOf";
import { type Measured, radiiBy, type Sizing } from "./radiiBy";
import type { HistoryRead } from "./readHistory";
import type { Snapshot } from "./Snapshot";
import { stabilityOf } from "./stabilityOf";
import { sweepsOf } from "./sweepsOf";
import { type Thread, threadsOf } from "./threadsOf";

/** What a ball's colour can say about its file. */
export type ColourLens = "plain" | "heat" | "exposure" | "stability";

/** What pointing at a file brings out: its arrows, as far as one, two, three or all of them reach; the group the arrows put it in; or what changed with it. */
export type Pointing = "1" | "2" | "3" | "all" | "group" | "together";

/** The lenses asked for. */
export interface LensChoice {
  readonly sizing: Sizing;
  readonly colour: ColourLens;
  /** Draw the threads of what changed together over the arrows. */
  readonly together: boolean;
  readonly pointing: Pointing;
}

/** What the picture is to draw, through the lenses asked for, at one commit. */
export interface Lenses {
  /** Each ball's radius, when its size says something other than its lines. */
  readonly sizes: ReadonlyMap<number, number> | null;
  /** Each ball's place on the colour's ramp, 0 to 1; a ball not in it is at 0. None when the colour is plain. */
  readonly tones: ReadonlyMap<number, number> | null;
  /** Warm, from cold to hot, for what changed; cool, from light to deep, for how stable. */
  readonly ramp: "warm" | "cool" | null;
  readonly threads: readonly Thread[];
  /** The box arrows that go against stability, as `from>to`. */
  readonly against: ReadonlySet<string>;
  /** Each file's group, when pointing at a file shows its group. */
  readonly groups: ReadonlyMap<number, number> | null;
  /** The lenses in words, for under the picture. */
  readonly said: string;
}

const NOTHING: Snapshot = { modules: [], dependencies: [] };

const SIZES: Readonly<Record<Sizing, string>> = {
  neededBy: "a ball as big as the files that need it",
  needs: "a ball as big as the files it needs",
  reachedBy: "a ball as big as all the files a change to it could reach",
  bridges: "a ball as big as it stands between the others",
  changes: "a ball as big as the commits that changed it so far",
  lines: "a ball as big as its lines",
};
const COLOURS: Readonly<Record<ColourLens, string>> = {
  plain: "",
  heat: "warm as it changed lately, cooling by half every six commits",
  exposure: "warm as the changes below it made it likely to change",
  stability: "as deep as its box is stable, by Robert C. Martin's measure, with the box arrows that go against it in red",
};
const POINTING: Readonly<Record<Pointing, string>> = {
  "1": "point at a file for what it needs, in blue, and what needs it, in orange",
  "2": "point at a file for what it needs and what needs it, two arrows out",
  "3": "point at a file for what it needs and what needs it, three arrows out",
  all: "point at a file for everything it needs and everything that needs it",
  group: "point at a file for its group: the files the arrows gather with it, whatever their box",
  together: "point at a file for what changed with it",
};

/** Each value over the largest, so the largest is whole; nothing over nothing is nothing. */
function scaled(values: ReadonlyMap<number, number>): Map<number, number> {
  const most = Math.max(0, ...values.values());
  return new Map([...values].map(([id, value]) => [id, most > 0 ? value / most : 0]));
}

/** The colour's tones at a commit, and the ramp they are on. */
function coloured(read: HistoryRead, at: number, colour: ColourLens, snapshot: Snapshot): Pick<Lenses, "tones" | "ramp" | "against"> {
  const none = { tones: null, ramp: null, against: new Set<string>() };
  if (colour === "plain") return none;
  if (colour === "heat") return { ...none, ramp: "warm", tones: new Map([...heatOf(read.lives, at)].map(([id, heat]) => [id, Math.min(1, heat)])) };
  if (colour === "exposure") {
    const standings = measuresOf.standings(read);
    const ground = groundOf(standings, cascadeFrom(standings, at), at);
    return { ...none, ramp: "warm", tones: scaled(new Map([...ground].map(([id, { expected }]) => [id, expected]))) };
  }
  const then = historyUpTo(read, at);
  const boxes = stabilityOf(snapshot, then.lives, sweepsOf(then.history));
  const instability = new Map(boxes.map((box) => [box.box, box.instability]));
  const tones = new Map(snapshot.modules.flatMap((module) => {
    const value = instability.get(boxOf(module.path));
    return value === undefined || value === null ? [] : [[module.id, 1 - value] as const];
  }));
  const against = new Set(againstStabilityOf(boxLinksOf(snapshot), boxes).map(({ from, to }) => `${from}>${to}`));
  return { tones, ramp: "cool", against };
}

/**
 * What the picture of the source draws, through the lenses asked for, at one
 * commit: how big each ball is, what its colour says, the threads of what
 * changed together, the group of each file, and all of it in words for under
 * the picture. The work is in node, where it is tested; the picture only draws.
 */
export function lensesOf(read: HistoryRead, at: number, choice: LensChoice): Lenses {
  const snapshot = read.snapshots[at] ?? NOTHING;
  // The sizes the snapshot alone cannot give, each measured only when asked for.
  const measures: Partial<Record<Sizing, () => Measured>> = {
    changes: () => ({ counts: changesUpTo(read.lives, at), most: Math.max(0, ...read.lives.map((life) => life.changed.length)) }),
    reachedBy: () => ({ counts: measuresOf.reach(snapshot) }),
    bridges: () => ({ counts: measuresOf.bridges(snapshot) }),
  };
  const sizes = radiiBy(snapshot, choice.sizing, measures[choice.sizing]?.());
  const threads = choice.together ? threadsOf(historyUpTo(read, at).history, snapshot) : [];
  const words = [SIZES[choice.sizing], COLOURS[choice.colour], choice.together ? "a warm thread for two files that changed together twice or more, dashed where no arrow joins them" : "", POINTING[choice.pointing]];
  return {
    sizes,
    ...coloured(read, at, choice.colour, snapshot),
    threads,
    groups: choice.pointing === "group" ? measuresOf.groups(snapshot) : null,
    said: words.filter(Boolean).join(" · "),
  };
}
