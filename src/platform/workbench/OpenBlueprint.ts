import type { Blueprint, PinRef, PlacedNode } from "../blueprint/Blueprint";
import { type Dial, dialsOf } from "../blueprint/dialsOf";
import type { Evaluation } from "../blueprint/Evaluation";
import { evaluateBlueprint } from "../blueprint/evaluateBlueprint";
import type { Example } from "../blueprint/examplesOf";
import { freshId } from "../blueprint/freshId";
import type { Literal, NodeKind } from "../blueprint/NodeKind";
import { parseBlueprint } from "../blueprint/parseBlueprint";
import { printBlueprint } from "../blueprint/printBlueprint";
import { type Resolved, resolvedEditor } from "../blueprint/resolvedEditor";
import { type Suggestion, suggestionsFor } from "../blueprint/suggestionsFor";
import { tidyBlueprint } from "../blueprint/tidyBlueprint";
import { withDial } from "../blueprint/withDial";
import { withNext } from "../blueprint/withNext";
import { withNode } from "../blueprint/withNode";
import { withValue } from "../blueprint/withValue";
import { withWire } from "../blueprint/withWire";
import type { BenchSetting } from "../plugin/Bench";
import { type Card, cardsOf } from "./cardsOf";
import { EditHistory } from "./EditHistory";

const KEPT = "As you left it: your changes are kept in this browser. Reset goes back to the page's own.";
const NONE: Example = { title: "", slug: "", about: "", text: "" };

/**
 * The blueprint open at a bench, whichever bench it is: which of the page's
 * examples, the blueprint it is now and every one it was, for undoing, what
 * a run of it made, and the reader's own version of it, kept. Every edit is
 * a new blueprint; every blueprint is run again at once, only what changed
 * running; and a file still on its way is waited for. A bench draws it and
 * hands it what hands do; it tells the bench when to draw again. It needs
 * no page to stand on, so what it decides is tested where there is none.
 */
export class OpenBlueprint {
  /** The example open, and the blueprint it is, which Reset goes back to. */
  example: Example;
  original: Blueprint;
  evaluation: Evaluation = new Map();
  /** How many times each node has run here: a bench can show what ran again. */
  readonly runs = new Map<string, number>();
  /** The board the build wrote, while it is still the board of what is open. */
  still: string | undefined;
  /** Whether a run has ended with nothing left waiting for a file: until then the board the build wrote is the better one to show. */
  ran = false;
  /** What there is to say of the last thing done, until the next edit. */
  notice: string;
  private history: EditHistory<Blueprint>;
  private scheduled = false;
  private stopped = false;
  /** Run only once it is near the screen: a page of blueprints does not run all of them for a reader who reads the first. */
  private awake = false;
  private readonly stopListening: () => void;

  /**
   * @param drawn told whenever the bench has to draw again: the blueprint changed, or a run of it ended
   * @param kept whether what is kept and linked to says where the nodes stand: a bench that lays them out itself has nothing to say
   */
  constructor(
    private readonly setting: BenchSetting,
    private readonly drawn: () => void,
    private readonly kept: { readonly positions: boolean } = { positions: true },
  ) {
    this.example = setting.start?.example ?? setting.examples[0] ?? NONE;
    this.original = this.laidOut(this.example.text);
    const own = setting.start?.text ?? setting.own.get(this.example);
    this.history = new EditHistory(own ? this.laidOut(own) : this.original);
    this.notice = setting.start?.said ?? (own ? KEPT : "");
    this.still = this.example === setting.examples[0] && !own ? setting.stillBoard : undefined;
    this.stopListening = setting.files.listen(() => this.schedule());
  }

  get now(): Blueprint {
    return this.history.now;
  }

  /** Whether it is the reader's own by now, and no longer as the page wrote it. */
  get own(): boolean {
    return this.history.now !== this.original;
  }

  get canUndo(): boolean {
    return this.history.canUndo;
  }

  get canRedo(): boolean {
    return this.history.canRedo;
  }

  /** One of the page's examples, opened: as the reader left it, if they did, and Reset going back to it. Says whether it was another than the one open. */
  open(example: Example): boolean {
    if (example === this.example) return false;
    this.example = example;
    this.original = this.laidOut(example.text);
    this.still = undefined;
    // What the one before made is not this one's: a node called as one of its nodes was may be another kind of node.
    this.evaluation = new Map();
    this.runs.clear();
    const own = this.setting.own.get(example);
    this.history = new EditHistory(own ? this.laidOut(own) : this.original);
    this.notice = own ? KEPT : `Opened here: ${example.title}`;
    this.changed();
    this.setting.opened?.(example);
    this.wake();
    return true;
  }

  /** A blueprint written by someone else — an agent — taken as an edit, so that Undo and Reset still work. */
  ask(text: string): void {
    this.edit(this.laidOut(text));
    this.notice = "Written by an agent. Undo, or Reset, goes back.";
    this.wake();
  }

  /** Near the screen: run the blueprint, and from now on whenever it changes. */
  wake(): void {
    this.awake = true;
    this.schedule();
  }

  stop(): void {
    this.stopped = true;
    this.stopListening();
  }

  /** A blueprint from its text, tidied when the text does not say where its nodes stand. */
  laidOut(text: string): Blueprint {
    const { blueprint, placed } = parseBlueprint(text, this.setting.kit);
    return placed ? blueprint : tidyBlueprint(blueprint, this.setting.kit);
  }

  /** A new blueprint, kept for undoing — joined with the edit before when they have one key — kept, drawn, and run. */
  edit(next: Blueprint, key?: string): void {
    this.history.push(next, key);
    this.notice = "";
    this.changed();
  }

  undo(): void {
    this.history.undo();
    this.changed();
  }

  redo(): void {
    this.history.redo();
    this.changed();
  }

  reset(): void {
    this.history.push(this.original);
    this.notice = "Back to the blueprint as the page wrote it.";
    this.changed();
  }

  /** A value written on an input, or rubbed out; while the hand that writes it has not let go, its edits are one step. */
  write(id: string, pin: string, value: Literal | undefined, done: boolean): void {
    this.edit(withValue(this.history.now, id, pin, value), done ? undefined : `${id}\u0000${pin}`);
  }

  /** A node of a kind added, standing where the bench says, with nothing wired into it — or with one input fed from an output there is, which is what a wire let go of in empty space asks for. What it is called. */
  add(kind: string, at: { readonly x: number; readonly y: number }, fed?: { readonly pin: string; readonly from: PinRef }): string {
    const node: PlacedNode = { id: freshId(this.history.now, kind), kind, x: at.x, y: at.y, values: {} };
    const added = withNode(this.history.now, node);
    this.edit(fed ? withWire(added, { from: fed.from, to: { node: node.id, pin: fed.pin } }) : added);
    return node.id;
  }

  /** A next step taken, its node standing where the bench says: what it is called, to be chosen in turn. */
  follow(id: string, offer: Suggestion, at: { readonly x: number; readonly y: number }): string {
    const { blueprint, added } = withNext(this.history.now, id, offer, at);
    this.edit(blueprint);
    return added;
  }

  /** An input put on the board: a dial wired into it, standing where the bench says, holding what the input holds now. What the dial is called; nothing, for an input that is not there. */
  promote(id: string, pin: string, at: { readonly x: number; readonly y: number }): string | null {
    const result = this.evaluation.get(id);
    const made = withDial(this.history.now, this.setting.kit, id, pin, result?.state === "done" ? result.settled[pin] : undefined, at);
    if (made) this.edit(made.blueprint);
    return made?.dial ?? null;
  }

  /** The blueprint as text a person writes on a page, which leaves where its nodes stand to the tidying. */
  text(): string {
    return printBlueprint(this.history.now, this.setting.kit, { positions: false });
  }

  /** A link that opens the blueprint as it now is. */
  link(): string {
    return this.setting.linkTo(this.example, printBlueprint(this.history.now, this.setting.kit, this.kept));
  }

  /** The dials of the board, as they now stand. */
  dials(): Dial[] {
    return dialsOf(this.history.now, this.setting.kit, this.setting.files.read, this.evaluation);
  }

  /** The pictures of the board, as the last run left them. */
  cards(): Card[] {
    return cardsOf(this.history.now, this.setting.kit, this.evaluation);
  }

  /** How each input of a node is written, as its kind says, worked out from what it was handed. */
  editorsOf(node: PlacedNode): Map<string, Resolved> {
    const { kit, files } = this.setting;
    return new Map((kit.kinds.get(node.kind)?.inputs ?? []).map((pin) => [pin.name, resolvedEditor(node, pin, kit, files.read, this.evaluation)]));
  }

  /** What could come after a node, read off what it gave: the kinds on trial among them only while their flag is on. */
  nextFor(id: string): Suggestion[] {
    const { kit } = this.setting;
    return suggestionsFor(this.history.now, id, kit, this.evaluation).filter((offer) => this.offers(kit.kinds.get(offer.kind)));
  }

  /** Whether a kind is offered to be added: every kind, but one on trial while its flag is off. */
  offers(kind: NodeKind | undefined): boolean {
    return kind !== undefined && (kind.flag === undefined || this.setting.isOn?.(kind.flag) === true);
  }

  private changed(): void {
    const now = this.history.now;
    this.setting.own.set(this.example, now === this.original ? null : printBlueprint(now, this.setting.kit, this.kept));
    this.drawn();
    this.schedule();
  }

  /** Run the blueprint soon — once, however many edits come before — so a slider dragged runs it once a frame, not once an event. */
  private schedule(): void {
    if (this.scheduled || this.stopped || !this.awake) return;
    this.scheduled = true;
    setTimeout(() => {
      this.scheduled = false;
      if (this.stopped) return;
      const before = this.evaluation;
      this.evaluation = evaluateBlueprint(this.history.now, this.setting.kit, { read: this.setting.files.read }, before);
      // A run keeps what did not change: what it made anew is what ran.
      for (const [id, result] of this.evaluation) if (result.state === "done" && result !== before.get(id)) this.runs.set(id, (this.runs.get(id) ?? 0) + 1);
      // The board the build wrote stays until every picture can be drawn here: it would only blink out into "fetching".
      this.ran ||= [...this.evaluation.values()].every((result) => result.state !== "waiting");
      this.drawn();
    }, 0);
  }
}
