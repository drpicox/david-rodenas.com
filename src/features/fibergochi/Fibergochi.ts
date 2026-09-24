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
const MOST_STRESSED = 100;
const MOST_FRIENDS = 100;
const SLEEPIEST = 30;
const MOST_RESTED = -10;
/** The chance, each hour of the middle of the day, that a class is due in the room and the terminal goes. */
const CLASS_IN_THE_ROOM = 0.05;
const BEGGING_WORKS = 0.3;
const BEGGING_TAKES = 10 / STEPS_AN_HOUR;
const CREDITS = { superior: 40, tecnica: 25 } as const;

type Mutable<T> = { -readonly [K in keyof T]: T[K] extends readonly (infer E)[] ? E[] : T[K] };
type Doing = FibergochiState["doing"];

const NEW: FibergochiState = {
  step: 0,
  hour: 0,
  day: 0,
  term: 1,
  doing: "idle",
  boredom: 0,
  stress: 0,
  labHabit: 10,
  studyHabit: 10,
  chatHabit: 10,
  barHabit: 10,
  friends: 10,
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
const TOO_STRESSED =
  "Don't you know that stress is really bad\nfor your health? Your Fibergochi has had to\nleave the faculty, be more careful next time!\nSee if you can take its mind off things a little,\nmake new and interesting friends... or not so much...";

/**
 * A student of the FIB, kept like a Tamagotchi: the Fibergochi of 2 March
 * 1999, its rules as they were and its words put into English. Every step it
 * studies, works at a terminal, browses, drinks at the bar or gets bored, and
 * goes back on its own to what it has lately done most; every hour it gets
 * sleepier; every day brings work five days ahead; every term it is marked,
 * and the Fase de Selección lets it through or throws it out. The dice are
 * handed in, so a test can load them.
 */
export class Fibergochi {
  private readonly s: Mutable<FibergochiState>;
  private readonly sprite = new Sprite();
  private beats = 0;

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
    return this.studyLeft > 0;
  }

  get labsPending(): boolean {
    return this.labLeft > 0;
  }

  /** Steps of study left, all its subjects together. */
  get studyLeft(): number {
    return this.taken(this.s.exams).reduce((sum, work) => sum + Math.max(work, 0), 0);
  }

  /** Steps of work at a terminal left, all its labs together. */
  get labLeft(): number {
    return this.taken(this.s.labs).reduce((sum, work) => sum + Math.max(work, 0), 0);
  }

  get hasTerminal(): boolean {
    return this.s.terminal > 0;
  }

  /** After the last day of class the exam and lab lamps blink, lit one beat of the picture in three. */
  get lampsLit(): boolean {
    return this.s.day < LAST_DAY_OF_CLASS || this.beats % 3 === 1;
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

  /** One step of the clock, in the order 1999 took them. */
  step(): void {
    if (!this.alive || this.waiting) return;
    this.keepHabits();
    this.studyOrWork();
    this.holdTerminal();
    this.browseOn();
    this.getBored();
    this.calmDown();
    if (!this.alive) return;
    this.searchTerminal();
    this.followHabits();
    this.stayAtBar();
    this.s.step += 1;
    if (this.s.step >= STEPS_AN_HOUR) {
      this.s.step = 0;
      this.nextHour();
    }
  }

  /** One beat of the picture: in 1999 it had a clock of its own, a tenth of a second whatever the speed of the days. */
  animate(): void {
    if (!this.alive || this.waiting) return;
    this.beats += 1;
    this.sprite.beat();
  }

  // ---- what the buttons ask of it

  /** It decides which, a coin toss; after the last day of class, neither. */
  studyOrSleep(): void {
    if (!this.alive) return;
    if (this.s.day <= LAST_DAY_OF_CLASS) this.set(this.random() < 0.5 ? "studying" : "asleep");
    else this.sprite.flash("no", 24);
  }

  browse(): void {
    if (!this.alive) return;
    if (this.s.terminal) this.set("browsing");
    else this.sprite.flash("no", 14);
  }

  goToBar(): void {
    if (this.alive) this.set("bar");
  }

  makeFriends(): void {
    if (this.alive) this.set("friends");
  }

  lookForTerminal(): void {
    if (!this.alive) return;
    if (this.s.terminal <= 0) this.set("looking");
    else this.sprite.flash("no", 10);
  }

  /** Only once classes are over, and for the subject nearest to passing: it works three times in ten, and costs stress every time. */
  beg(): void {
    if (!this.alive) return;
    const { exams, labs } = this.s;
    const left = (at: number) => exams[at]! + labs[at]!;
    const owed = this.taken(exams)
      .map((_, at) => at)
      .filter((at) => left(at) > 0);
    if (this.s.day < LAST_DAY_OF_CLASS || owed.length === 0) return this.sprite.flash("no", 10);
    const nearest = owed.reduce((best, at) => (left(at) < left(best) ? at : best));
    this.sprite.flash("suplica", 20);
    if (this.random() < BEGGING_WORKS) exams[nearest]! -= this.random() * BEGGING_TAKES;
    this.s.stress += BEGGING_TAKES * this.random();
  }

  /** The score, as the alfa key showed it in an alert box. */
  alfa(): void {
    if (!this.alive) return;
    const { term, left, selection, alfas, enrolled, exams, labs, day, passed } = this.s;
    let said = `Score: this is term ${term} you have been at the FIB.\n\n`;
    if (selection) {
      said += `You are doing the Selection Phase.\nYou have ${left} credits left to finish it.\n\n`;
    } else {
      said += `You are in the middle of the degree, and have ${left} credits left to finish.\n\n`;
      // 1999 counted these from nothing at all, and so always found a spotless record.
      const notable = alfas.filter((alfa) => alfa < 1).length;
      const dangerous = alfas.filter((alfa) => alfa <= 0.5).length;
      if (notable > 0) {
        said += `Of your last six alfa parameters at most, you have:\n - ${notable} notable.\n`;
        if (dangerous > 0) said += ` - of these, ${dangerous} dangerous.\n`;
        said += "\n";
        alfas.forEach((alfa, at) => {
          if (alfa < 1) said += `The alfa of ${alfas.length - at} terms ago:\t${Math.round(alfa * 100) / 100}.\n`;
        });
        said += "\n";
      } else said += "You have an impeccable record. (swot)\n\n";
    }
    if (day <= MARKS_DAY) {
      const counts = [0, 0, 0, 0, 0];
      for (let at = 0; at < enrolled; at += 1) {
        const work = exams[at]! + labs[at]!;
        counts[work <= 0 ? 0 : work <= 2 * STEPS_AN_HOUR ? 1 : work <= 5 * STEPS_AN_HOUR ? 2 : work <= 8 * STEPS_AN_HOUR ? 3 : 4]! += 1;
      }
      const lines = [
        "subjects going well",
        "that will go well with a little effort",
        "subjects you should get down to",
        "subjects you find hard",
        "subjects you had better pray for",
      ];
      counts.forEach((count, at) => {
        if (count > 0) said += `You have ${count} ${lines[at]}.\n`;
      });
      said += `You are enrolled in ${enrolled} subjects in all.`;
    } else said += `Of ${enrolled}, ${passed} are passed.`;
    this.s.said.push(said);
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

  private keepHabits(): void {
    const { doing } = this.s;
    if (doing === "lab") this.s.labHabit += 1;
    else if (doing === "studying") this.s.studyHabit += 1;
    else if (doing === "browsing") this.s.chatHabit += 1;
    else if (doing === "friends") this.s.friends += 1;
    else if (doing === "bar") {
      this.s.barHabit += 1;
      this.s.friends += 0.4;
    }
    this.s.friends = Math.min(this.s.friends, MOST_FRIENDS);
  }

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
    // Doing a lab it holds on to the terminal, and even gains time on it; browsing, it keeps it longer on the days with fewer labs due.
    if (this.s.doing === "lab") this.s.terminal = Math.round(this.s.terminal + this.random());
    else if (this.s.doing !== "browsing" || this.random() <= ODDS.labs[this.s.day]!) this.s.terminal -= 1;
    this.s.terminal = Math.max(this.s.terminal, 0);
  }

  private browseOn(): void {
    if (this.s.doing !== "browsing") return;
    this.s.boredom += Math.round(0.5 * this.random());
    if (this.s.terminal <= 0) this.set("idle");
  }

  private getBored(): void {
    const { doing } = this.s;
    if (doing === "idle") {
      this.s.boredom += 1;
      // The face changes with the boredom, so it is looked at again every ten.
      if (this.s.boredom % 10 === 0) this.set("idle");
    } else if (doing === "studying") this.s.boredom += 0.1;
    else if (doing === "lab") this.s.boredom += this.random() / 2;
    else if (doing === "asleep") this.s.boredom -= 1;
    else if (doing === "bar") this.s.boredom -= this.random();
    if (this.s.boredom > MOST_BORED) return this.end("bad", TOO_BORED);
    this.s.boredom = Math.max(this.s.boredom, -MOST_BORED / 2);
  }

  private calmDown(): void {
    if (this.s.doing === "bar") this.s.stress -= 1;
    this.s.stress = Math.max(this.s.stress, 0);
    if (this.s.stress > MOST_STRESSED) this.end("bad", TOO_STRESSED);
  }

  private searchTerminal(): void {
    const { doing, day } = this.s;
    if (doing === "looking" && day <= LAST_DAY_OF_CLASS && this.s.terminal <= 0) {
      this.s.stress += 1;
      // Near an exam everybody leaves; near a lab's deadline nobody does.
      const chance = (0.5 + ODDS.exams[day]!) * (1 - ODDS.labs[day]!);
      const roll = this.random();
      if (roll <= chance) {
        const most = (roll <= chance / 2 ? 4 : 2) * (STEPS_AN_HOUR + 1);
        this.s.terminal = Math.round(most * this.random());
        this.set("idle");
      }
    } else if (doing === "looking") this.set("idle");
    if (day > LAST_DAY_OF_CLASS) this.s.terminal = 0;
  }

  /**
   * What it does on its own, from its habits: at a terminal it drifts between
   * the lab and http as it has lately worked or chatted more, and away from
   * one, if it has studied less than it has drunk, the bar takes it from its
   * books — easily by day, hardly early in the morning.
   */
  private followHabits(): void {
    const { doing, hour } = this.s;
    const workOverChat = this.s.labHabit / this.s.chatHabit / 2;
    const chatOverWork = this.s.chatHabit / this.s.labHabit / 2;
    const studyOverBar = this.s.studyHabit / this.s.barHabit / 2;
    const labs = this.labsPending;
    const chance = (odds: number) => this.random() < odds;
    if (this.s.terminal > 0) {
      if (doing === "lab") {
        if (workOverChat <= 0.5) {
          if (chance(0.5 - workOverChat)) this.set("browsing");
        } else if (!labs) this.set(this.random() > (0.5 - chatOverWork) * 2 ? "browsing" : "idle");
      } else if (doing === "browsing") {
        if (labs) {
          // With little time left on the terminal, the lab calls harder.
          const [often, seldom] = this.s.terminal < STEPS_AN_HOUR ? [2, 1] : [1, 2];
          if (chatOverWork <= 0.5 ? chance((0.5 - chatOverWork) * often) : this.random() > (0.5 - workOverChat) * seldom) this.set("lab");
        } else if (chatOverWork < 0.5 && this.random() * 0.4 > chatOverWork) this.set("idle");
      } else if (doing === "idle" || doing === "studying") {
        if (this.s.friends > MOST_FRIENDS / 2 && chance(0.5 - studyOverBar)) this.set("bar");
        if (chatOverWork <= 0.5 && chance(0.5 - chatOverWork)) this.set("browsing");
        if (workOverChat <= 0.5 && chance(0.5 - workOverChat) && labs) this.set("lab");
      }
    } else if (doing === "studying" && studyOverBar <= 0.5) {
      const hard = hour < HOURS_A_DAY / 4 ? STEPS_AN_HOUR : hour > (3 * HOURS_A_DAY) / 4 ? STEPS_AN_HOUR / 2 : 1;
      if (this.random() * hard < 0.5 - studyOverBar) this.set("bar");
    }
  }

  /** It stays at the bar for as long as it has friends there. */
  private stayAtBar(): void {
    if (this.s.doing === "bar" && this.s.friends / MOST_FRIENDS < this.random() / 2) this.set("idle");
  }

  // ---- every hour

  private nextHour(): void {
    this.getSleepy();
    if (this.s.doing === "lab") this.s.boredom += Math.round(4 * this.random());
    this.classInTheRoom();
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

  /** The terminal rooms were classrooms too, on the VAX: in the middle of the day a class can turn it out. */
  private classInTheRoom(): void {
    const { hour } = this.s;
    if (hour >= HOURS_A_DAY / 3 && hour <= (2 * HOURS_A_DAY) / 3 && this.random() < CLASS_IN_THE_ROOM) this.s.terminal = 0;
  }

  // ---- every day

  private nextDay(): void {
    const { day } = this.s;
    this.fadeHabits();
    if (day < LAST_DAY_OF_CLASS) this.bringWork();
    else if (day === MARKS_DAY) this.mark();
    if (day < DAYS_A_TERM - 1) {
      this.s.day += 1;
      return;
    }
    this.s.day = 0;
    this.nextTerm();
  }

  private fadeHabits(): void {
    const fade = (habit: number) => Math.max(1, Math.round(habit * 0.9));
    this.s.labHabit = fade(this.s.labHabit);
    this.s.studyHabit = fade(this.s.studyHabit);
    this.s.barHabit = fade(this.s.barHabit);
    this.s.chatHabit = fade(this.s.chatHabit);
    this.s.friends = fade(this.s.friends);
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
    else if (doing === "friends") this.sprite.play("amig");
    else if (doing === "browsing") this.sprite.play("http");
    else if (doing === "bar") this.sprite.play("bar0");
    else {
      // Boredom and stress together wear the face down; stress alone, past two thirds, does it at once.
      const worn = this.s.boredom + this.s.stress;
      const most = MOST_BORED + MOST_STRESSED;
      if (worn < most / 3) this.sprite.play("normal");
      else if (worn < most / 1.5) this.sprite.play("normal1");
      else this.sprite.play("normal2");
      if (this.s.stress > (MOST_STRESSED * 2) / 3) this.sprite.play("normal2");
    }
  }

  private end(how: "good" | "bad", ...said: string[]): void {
    this.s.said.push(...said);
    if (how === "bad") this.s.said.push(EXPELLED);
    this.s.ended = how;
    this.s.asks = null;
    this.sprite.stop();
  }
}
