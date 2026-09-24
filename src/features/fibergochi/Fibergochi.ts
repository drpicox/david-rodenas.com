import type { FibergochiState } from "./FibergochiState";
import { ODDS } from "./ODDS";
import { Sprite } from "./Sprite";

/** The calendar of 1999: a day has sixteen hours, a term twenty-five days, of which twenty have classes. */
const STEPS_AN_HOUR = 3;
const HOURS_A_DAY = 16;
const DAYS_A_TERM = 25;
const LAST_DAY_OF_CLASS = 20;
const MARKS_DAY = 22;
const MOST_BORED = 200;
const SLEEPIEST = 30;
const MOST_RESTED = -10;
const CREDITS = { superior: 100, tecnica: 50 } as const;

type Mutable<T> = { -readonly [K in keyof T]: T[K] extends readonly (infer E)[] ? E[] : T[K] };
type Doing = FibergochiState["doing"];

const NEW: FibergochiState = {
  step: 0,
  hour: 0,
  day: 0,
  term: 1,
  doing: "idle",
  boredom: 0,
  sleep: 0,
  terminal: 0,
  exams: Array(10).fill(0),
  labs: Array(10).fill(0),
  enrolled: 4,
  passed: 0,
  left: 9,
  selection: true,
  alfas: Array(6).fill(1),
  asks: null,
  suggested: 0,
  ended: null,
  said: [],
};

const EXPELLED = "Sorry, but you no longer belong to this faculty. :(\n\n\n\nNormal.";
const TOO_BORED =
  "Hey, what are you playing at????\nHave you never had a pet??!!!??\nThanks to you the poor thing nearly died of\nboredom in this faculty!!!! Let's see if\nwe give it a little more attention,\nand the excuse that it gets bored\nbecause there are no girls at the FIB won't do!\n(because there are, and some of them are really\npretty, and this is not flattery, boti boti boti).\nSo now you know, this is all\nYOUR FAULT (a pet gets a little\nattention, doesn't it?)";

/**
 * A student of the FIB, kept like a Tamagotchi: the Fibergochi of February
 * 1999, its rules as they were and its words put into English. Every step
 * it studies, works at a terminal, browses, or gets bored; every hour it gets sleepier; every day brings work
 * five days ahead; every term it is marked, and the Fase de Selección lets it
 * through or throws it out. The dice are handed in, so a test can load them.
 */
export class Fibergochi {
  private readonly s: Mutable<FibergochiState>;
  private readonly sprite = new Sprite();

  constructor(
    private readonly random: () => number,
    kept: Partial<FibergochiState> = {},
  ) {
    const state = { ...NEW, ...kept };
    this.s = { ...state, exams: [...state.exams], labs: [...state.labs], alfas: [...state.alfas], said: [...state.said] };
    if (this.s.ended === null) this.show(this.s.doing);
  }

  get state(): FibergochiState {
    return { ...this.s, exams: [...this.s.exams], labs: [...this.s.labs], alfas: [...this.s.alfas], said: [...this.s.said] };
  }

  get picture(): string {
    return this.sprite.image;
  }

  /** The day, and the sixteen hours spread over a day of twenty-four, as the box under the buttons showed them. */
  get clock(): string {
    const steps = this.s.step + this.s.hour * STEPS_AN_HOUR;
    const minutes = (steps * 30) % 60;
    return `${this.s.day + 1}, ${Math.floor((steps / (STEPS_AN_HOUR * HOURS_A_DAY)) * 24)}:${minutes < 10 ? "0" : ""}${minutes}h (${this.s.term})`;
  }

  get examsPending(): boolean {
    return this.taken(this.s.exams).some((work) => work > 0);
  }

  get labsPending(): boolean {
    return this.taken(this.s.labs).some((work) => work > 0);
  }

  get hasTerminal(): boolean {
    return this.s.terminal > 0;
  }

  get enrolment(): { most: number; suggested: number } {
    return { most: Math.min(10, this.s.left), suggested: this.s.suggested };
  }

  get alive(): boolean {
    return this.s.ended === null;
  }

  /** Something to read, or a question to answer: time stands still until it is done, as it did behind an alert box. */
  get waiting(): boolean {
    return this.s.said.length > 0 || this.s.asks !== null;
  }

  /** One step of the clock, and one beat of the picture. */
  beat(): void {
    if (!this.alive || this.waiting) return;
    this.studyOrWork();
    this.holdTerminal();
    this.browseOn();
    this.getBored();
    if (!this.alive) return;
    this.searchTerminal();
    this.s.step += 1;
    if (this.s.step >= STEPS_AN_HOUR) {
      this.s.step = 0;
      this.nextHour();
    }
    this.sprite.beat();
  }

  // ---- what the buttons ask of it

  /** It decides which, a coin toss; after the last day of class, neither. */
  studyOrSleep(): void {
    if (!this.alive) return;
    if (this.s.day <= LAST_DAY_OF_CLASS) this.set(this.random() < 0.5 ? "studying" : "asleep");
    else this.sprite.shake(24);
  }

  browse(): void {
    if (!this.alive) return;
    if (this.s.terminal) this.set("browsing");
    else this.sprite.shake(14);
  }

  lookForTerminal(): void {
    if (!this.alive) return;
    if (this.s.terminal <= 0) this.set("looking");
    else this.sprite.shake(10);
  }

  beg(): void {
    if (this.alive) this.sprite.shake(30);
  }

  /** The oldest thing said, read. */
  dismiss(): void {
    this.s.said.shift();
  }

  enrol(credits: number): boolean {
    if (this.s.asks !== "enrol" || !Number.isInteger(credits) || credits < 1 || credits > this.enrolment.most) return false;
    this.s.enrolled = credits;
    this.s.asks = null;
    return true;
  }

  choose(degree: keyof typeof CREDITS): void {
    if (this.s.asks !== "degree") return;
    this.s.left = CREDITS[degree];
    this.askEnrolment();
  }

  // ---- every step

  private studyOrWork(): void {
    if (this.s.doing === "lab") {
      if (!this.labsPending) return this.set("idle");
      const at = this.easiest(this.s.labs);
      // A lab goes faster the better its theory is known.
      if (100 - this.s.exams[at]! > this.random() * 100) this.s.labs[at]! -= 1;
    } else if (this.s.doing === "studying") {
      if (!this.examsPending) return this.set("idle");
      this.s.exams[this.easiest(this.s.exams)]! -= 1;
    }
  }

  /** The subject with least work left of the ones that need this kind, leaning to the first: its favourite, or the one it is repeating. */
  private easiest(work: readonly number[]): number {
    const { exams, labs } = this.s;
    let best = this.taken(work).findIndex((left) => left > 0);
    let least = exams[best]! + labs[best]! + best;
    for (let at = best + 1; at < this.s.enrolled; at += 1) {
      const total = exams[at]! + labs[at]!;
      if (least > total && work[at]! > 0) {
        best = at;
        least = total + at;
      }
    }
    return best;
  }

  private holdTerminal(): void {
    if (this.s.day > LAST_DAY_OF_CLASS || this.s.terminal <= 0) {
      this.s.terminal = 0;
      return;
    }
    if (this.s.doing === "idle" && this.labsPending) this.set("lab");
    // A terminal is kept for as long as the lab lasts, and while browsing, longer on the days with fewer labs due.
    if (this.s.doing === "lab") return;
    if (this.s.doing !== "browsing" || this.random() <= ODDS.labs[this.s.day]!) this.s.terminal -= 1;
  }

  private browseOn(): void {
    if (this.s.doing !== "browsing") return;
    this.s.boredom += Math.round(0.5 * this.random());
    if (this.s.terminal <= 0) this.set("idle");
  }

  private getBored(): void {
    if (this.s.doing === "idle") {
      this.s.boredom += 1;
      // The face changes with the boredom, so it is looked at again every ten.
      if (this.s.boredom % 10 === 0) this.set("idle");
    } else if (this.s.doing === "studying") this.s.boredom += 0.1;
    else if (this.s.doing === "asleep") this.s.boredom -= 1;
    if (this.s.boredom > MOST_BORED) this.end("bad", TOO_BORED);
  }

  private searchTerminal(): void {
    const { doing, day } = this.s;
    if (doing !== "looking" || day >= LAST_DAY_OF_CLASS || this.s.terminal > 0) return;
    // Near an exam everybody leaves; near a lab's deadline nobody does.
    const chance = (0.5 + ODDS.exams[day]!) * (1 - ODDS.labs[day]!);
    const roll = this.random();
    if (roll > chance) return;
    const most = (roll <= chance / 2 ? 4 : 2) * (STEPS_AN_HOUR + 1);
    this.s.terminal = Math.round(most * this.random());
    this.set("idle");
  }

  // ---- every hour

  private nextHour(): void {
    this.getSleepy();
    if (this.s.doing === "lab") this.s.boredom += Math.round(4 * this.random());
    if (this.s.hour < HOURS_A_DAY - 1) {
      this.s.hour += 1;
      return;
    }
    this.s.hour = 0;
    this.nextDay();
  }

  private getSleepy(): void {
    const morning = this.s.hour < (HOURS_A_DAY * 3) / 4;
    if (this.s.doing !== "asleep") {
      if (morning) this.s.sleep += 1;
      else if (this.s.doing === "idle" && this.s.sleep > 5) this.set("asleep");
      else this.s.sleep += 2 + (this.s.terminal > 0 ? 1 : 0);
      // At a terminal it holds on, as if doped, a quarter longer.
      if (this.s.sleep > (this.s.terminal > 0 ? SLEEPIEST * 1.25 : SLEEPIEST)) this.set("asleep");
    } else if (morning && this.s.sleep < MOST_RESTED / 4) {
      this.set("idle");
    } else {
      this.s.sleep -= 2;
      if (this.s.sleep < MOST_RESTED) this.set("idle");
    }
  }

  // ---- every day

  private nextDay(): void {
    const { day } = this.s;
    if (day < LAST_DAY_OF_CLASS) this.bringWork();
    else if (day === MARKS_DAY) this.mark();
    if (day < DAYS_A_TERM - 1) {
      this.s.day += 1;
      return;
    }
    this.s.day = 0;
    this.nextTerm();
  }

  /** Work for the day five ahead, and on the first day for all six at once. */
  private bringWork(): void {
    const ahead = this.s.day + 5;
    if (this.s.day === 0) for (let day = ahead; day >= 0; day -= 1) this.bringWorkFor(day);
    else if (ahead < LAST_DAY_OF_CLASS) this.bringWorkFor(ahead);
  }

  private bringWorkFor(day: number): void {
    for (let at = 0; at < this.s.enrolled; at += 1) {
      // Further down the list, a subject is harder and brings more.
      const most = STEPS_AN_HOUR * ((at + 1) / 2) + 1;
      if (this.random() <= ODDS.labs[day]!) this.s.labs[at]! += Math.round(most * this.random());
      if (this.random() <= ODDS.exams[day]!) this.s.exams[at]! += Math.round(most * this.random());
    }
  }

  /** A subject is passed if less than an hour of work is left on it, exam and lab together. */
  private mark(): void {
    for (let at = 0; at < this.s.enrolled; at += 1) {
      if (this.s.exams[at]! + this.s.labs[at]! < STEPS_AN_HOUR) this.s.passed += 1;
    }
    this.s.alfas = [...this.s.alfas.slice(1), this.s.alfas[5]!];
    this.s.exams.fill(0);
    this.s.labs.fill(0);
  }

  // ---- every term

  private nextTerm(): void {
    const { enrolled, passed, selection, term } = this.s;
    // In the Fase de Selección the alfas do not count.
    this.s.alfas[5] = selection ? 1 : enrolled ? passed / enrolled : 0;
    if (this.s.alfas.filter((alfa) => alfa < 0.5).length > 3) return this.end("bad", "You have 4 Alfa parameters below 0.5, bye, bye.");
    this.s.left -= passed;
    this.s.passed = 0;
    this.s.term += 1;
    if (this.s.left <= 0) {
      if (!selection) return this.end("good", "Very Good!\nYou did it!!!!!!!\nYour Fibergochi has finished the degree!!!!!\n", "ERROR 315: in module KERNEL386.EXE,\npage 0137:0A285F43.\nAn UNFORESEEN situation has occurred,\nwe are very sorry, but we thought that\nnobody would ever get here, where no\nother man has gone before!.");
      this.s.selection = false;
      this.s.said.push("You have SUCCESSFULLY finished the SELECTION PHASE!!!!!");
      this.s.asks = "degree";
      return;
    }
    if (selection && term === 2 && this.s.left > 8) return this.end("bad", "BACARRA!!!!");
    if (selection && term > 3) {
      if (this.s.left > 2) return this.end("bad", "You have not got through the Selection Phase.");
      this.s.said.push("You have not passed everything, but it is not serious.\nYOU HAVE GOT THROUGH THE SELECTION PHASE, but... They will not throw you out, but you have to go to\nthe Técnica (or rather, they make you).");
      this.s.left = CREDITS.tecnica;
      // 1999 forgot this line, and the next term threw out the student it had just let through.
      this.s.selection = false;
    }
    this.askEnrolment();
  }

  private askEnrolment(): void {
    this.s.asks = "enrol";
    this.s.suggested = Math.min(Math.round(this.random() * 4) + 3, this.s.left);
  }

  // ---- what it is doing, and how it looks

  private taken(work: readonly number[]): readonly number[] {
    return work.slice(0, this.s.enrolled);
  }

  private set(doing: Doing): void {
    this.s.doing = doing;
    this.show(doing);
  }

  private show(doing: Doing): void {
    if (doing === "lab") this.sprite.play("pract");
    else if (doing === "studying") this.sprite.play("est");
    else if (doing === "asleep") this.sprite.play("zz");
    else if (doing === "looking") this.sprite.play("bt");
    else if (doing === "browsing") this.sprite.play("http");
    else if (this.s.boredom < MOST_BORED / 3) this.sprite.play("normal");
    else if (this.s.boredom < MOST_BORED / 1.5) this.sprite.play("normal1");
    else this.sprite.play("normal2");
  }

  private end(how: "good" | "bad", ...said: string[]): void {
    this.s.said.push(...said);
    if (how === "bad") this.s.said.push(EXPELLED);
    this.s.ended = how;
    this.s.asks = null;
    this.sprite.stop();
  }
}
