import { items, monsters, rooms } from "./englishWorld";
import type { Item, Monster, Room } from "./World";

export type Direction = "norte" | "sur" | "este" | "oeste";
const DIRECTIONS: readonly Direction[] = ["norte", "sur", "este", "oeste"];
/** The directions as they are said to the player. */
export const DIRECTION_NAMES: Readonly<Record<Direction, string>> = { norte: "north", sur: "south", este: "east", oeste: "west" };
const STEP: Readonly<Record<Direction, readonly [number, number]>> = { norte: [1, 0], sur: [-1, 0], este: [0, 1], oeste: [0, -1] };

/** What the room holds now: an item, a monster, or nothing. */
type Holding = { readonly item: Item } | { readonly monster: Monster } | null;

interface Place {
  readonly room: Room;
  exits: [number, number, number, number];
  holds: Holding;
}

export interface Seen {
  readonly name: string;
  readonly text: string;
  readonly monster?: string;
  readonly item?: string;
  /** The open directions, and whether each is a locked door. */
  readonly exits: readonly { readonly direction: Direction; readonly locked: boolean }[];
  readonly at: readonly [number, number];
  readonly life: number;
  readonly weapon?: string;
  readonly shield?: string;
  readonly key?: string;
}

export const LIFE = 16;
const START: readonly [number, number] = [0, 0];
const GOAL: readonly [number, number] = [1, 0];

const byName = <T extends { name: string }>(list: readonly T[], name: string) => list.find((one) => one.name === name);

function holdingOf(name: string): Holding {
  const item = byName(items, name);
  if (item) return { item };
  const monster = byName(monsters, name);
  return monster ? { monster } : null;
}

/**
 * The 2007 adventure, rule for rule. A player is a place, a life, and at most
 * one weapon, one shield and one key; a room holds at most one thing. Taking
 * a weapon, shield or key swaps it for the one held; food is eaten on the
 * spot. A locked door takes the key that fits, and keeps it. A fight is one
 * exchange of blows: the monster falls if the weapon beats its defence, the
 * player is hurt if its attack beats the shield, and both may happen at once.
 * The quirks are kept: a door opened from one side is still locked from the
 * other, and a monster does not bar the way — only a door does.
 */
export class Adventure {
  private readonly places = new Map<string, Place>();
  private at: [number, number] = [START[0], START[1]];
  private life = LIFE;
  private weapon: Item | null = null;
  private shield: Item | null = null;
  private key: Item | null = null;
  /** Every room stood in, for the map. */
  readonly visited = new Set<string>();

  constructor() {
    for (const [where, room] of Object.entries(rooms)) {
      this.places.set(where, { room, exits: [...room.exits], holds: holdingOf(room.holds) });
    }
    this.visited.add(this.here());
  }

  private here(): string {
    return `${this.at[0]},${this.at[1]}`;
  }

  private place(): Place {
    const place = this.places.get(this.here());
    if (!place) throw new Error(`no room at ${this.here()}`);
    return place;
  }

  get won(): boolean {
    return this.at[0] === GOAL[0] && this.at[1] === GOAL[1];
  }

  /** The original checked this only on the way out: a first-year lab was not the place to die. So does this. */
  get spent(): boolean {
    return this.life <= 0;
  }

  /** The game as text, as `salvar` wrote it, and back. */
  save(): string {
    return JSON.stringify({
      at: this.at,
      life: this.life,
      held: [this.weapon?.name ?? null, this.shield?.name ?? null, this.key?.name ?? null],
      visited: [...this.visited],
      places: [...this.places].map(([where, place]) => [where, place.exits, place.holds ? ("item" in place.holds ? place.holds.item.name : place.holds.monster.name) : null]),
    });
  }

  static load(saved: string): Adventure {
    const data = JSON.parse(saved) as { at: [number, number]; life: number; held: (string | null)[]; visited: string[]; places: [string, [number, number, number, number], string | null][] };
    const game = new Adventure();
    game.at = data.at;
    game.life = data.life;
    [game.weapon, game.shield, game.key] = data.held.map((name) => (name ? (byName(items, name) ?? null) : null)) as [Item | null, Item | null, Item | null];
    game.visited.clear();
    for (const where of data.visited) game.visited.add(where);
    for (const [where, exits, holds] of data.places) {
      const place = game.places.get(where);
      if (place) Object.assign(place, { exits, holds: holds ? holdingOf(holds) : null });
    }
    return game;
  }

  look(): Seen {
    const { room, exits, holds } = this.place();
    return {
      name: room.name,
      text: room.text,
      ...(holds && "monster" in holds ? { monster: holds.monster.name } : {}),
      ...(holds && "item" in holds ? { item: holds.item.name } : {}),
      exits: DIRECTIONS.flatMap((direction, index) => ((exits[index] ?? -1) >= 0 ? [{ direction, locked: (exits[index] ?? 0) > 0 }] : [])),
      at: [this.at[0], this.at[1]],
      life: this.life,
      ...(this.weapon ? { weapon: this.weapon.name } : {}),
      ...(this.shield ? { shield: this.shield.name } : {}),
      ...(this.key ? { key: this.key.name } : {}),
    };
  }

  go(direction: Direction): string {
    const place = this.place();
    const index = DIRECTIONS.indexOf(direction);
    const door = place.exits[index] ?? -1;
    if (door < 0) return "There is no way out that way.";
    if (door > 0) {
      if (!this.key || this.key.value !== door) return "The way is locked and you are not carrying the key.";
      place.exits[index] = 0;
      this.key = null;
    }
    const [di, dj] = STEP[direction];
    this.at = [this.at[0] + di, this.at[1] + dj];
    this.visited.add(this.here());
    return "";
  }

  take(): string {
    const place = this.place();
    if (!place.holds || !("item" in place.holds)) return "There is nothing here to take!";
    const { item } = place.holds;
    if (item.kind === "food") {
      this.life = Math.min(LIFE, this.life + item.value);
      place.holds = null;
      return "Yum yum!";
    }
    const slot = item.kind;
    const held = this[slot];
    this[slot] = item;
    place.holds = held ? { item: held } : null;
    return { weapon: "You have taken a weapon.", shield: "You have taken a shield.", key: "You have taken a key." }[slot];
  }

  attack(): string {
    const place = this.place();
    if (!place.holds || !("monster" in place.holds)) return "There is no monster to attack!";
    if (!this.weapon) return "You have no weapon to attack with!";
    const { monster } = place.holds;
    const said: string[] = [];
    if (this.weapon.value - monster.defence > 0) {
      const drop = byName(items, monster.drops);
      place.holds = drop ? { item: drop } : null;
      said.push("The monster has been defeated!");
    }
    const hurt = monster.attack - (this.shield?.value ?? 0);
    if (hurt > 0) {
      this.life -= hurt;
      said.push("OUCH!");
    }
    return said.join(" ") || "Neither of you gets anywhere.";
  }

  /** A line as the player types it, in English or in the game's original Spanish. */
  run(line: string): string {
    const word = line.trim().toLowerCase();
    const direction = ({ norte: "norte", north: "norte", n: "norte", sur: "sur", south: "sur", s: "sur", este: "este", east: "este", e: "este", oeste: "oeste", west: "oeste", w: "oeste" } as Record<string, Direction>)[word];
    if (direction) return this.go(direction);
    if (word === "coger" || word === "take" || word === "get") return this.take();
    if (word === "atacar" || word === "attack" || word === "hit") return this.attack();
    if (word === "mirar" || word === "look" || word === "l" || word === "") return "";
    return "I do not understand you.";
  }
}
