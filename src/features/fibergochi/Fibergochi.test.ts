import { describe, expect, it } from "vitest";
import { randomOf } from "../../platform/random/randomOf";
import { Fibergochi } from "./Fibergochi";

const always = (value: number) => () => value;
const beats = (fibergochi: Fibergochi, count: number) => {
  for (let n = 0; n < count; n += 1) fibergochi.beat();
};
/** The last beat of a day: the next one turns the hour, the day, and perhaps the term. */
const endOf = (day: number) => ({ day, hour: 15, step: 2 });

describe("a new Fibergochi", () => {
  it("has just arrived: the first term of the Fase de Selección, four credits taken of the nine it needs", () => {
    const { state } = new Fibergochi(always(0.5));
    expect(state).toMatchObject({ term: 1, day: 0, hour: 0, selection: true, enrolled: 4, left: 9, doing: "idle" });
    expect(new Fibergochi(always(0.5)).clock).toBe("1, 0:00h (1)");
  });

  it("lives three steps an hour and sixteen hours a day, which the clock spreads over twenty-four", () => {
    const fibergochi = new Fibergochi(always(0.99));
    beats(fibergochi, 3 * 9);
    expect(fibergochi.clock).toBe("1, 13:30h (1)");
    beats(fibergochi, 3 * 7);
    expect(fibergochi.clock).toBe("2, 0:00h (1)");
  });
});

describe("the work of a term", () => {
  it("arrives five days ahead, and more of it for the subjects further down the list", () => {
    const fibergochi = new Fibergochi(always(0.5), endOf(5));
    fibergochi.beat();
    expect(fibergochi.state.exams.slice(0, 4)).toEqual([1, 2, 3, 4]);
    expect(fibergochi.examsPending).toBe(true);
  });

  it("is studied for the subject nearest to passing first", () => {
    const fibergochi = new Fibergochi(always(0.99), { day: 3, doing: "studying", enrolled: 2, exams: [5, 2, 0, 0, 0, 0, 0, 0, 0, 0] });
    fibergochi.beat();
    expect(fibergochi.state.exams.slice(0, 2)).toEqual([5, 1]);
  });

  it("marks a subject passed on the twenty-second day if less than an hour of work is left on it", () => {
    const fibergochi = new Fibergochi(always(0.99), {
      ...endOf(22),
      enrolled: 3,
      exams: [1, 5, 0, 0, 0, 0, 0, 0, 0, 0],
      labs: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      alfas: [1, 0.5, 1, 1, 1, 0.2],
    });
    fibergochi.beat();
    expect(fibergochi.state.passed).toBe(2);
    expect(fibergochi.state.exams.every((work) => work === 0)).toBe(true);
    expect(fibergochi.state.alfas).toEqual([0.5, 1, 1, 1, 0.2, 0.2]);
  });
});

describe("what it can be asked to do", () => {
  it("shakes its head at a terminal it does not have", () => {
    const fibergochi = new Fibergochi(always(0.5));
    fibergochi.browse();
    expect(fibergochi.picture).toMatch(/^no\d$/);
    expect(fibergochi.state.doing).toBe("idle");
  });

  it("browses once it has one, and a terminal found the day before the exams is found fast", () => {
    const fibergochi = new Fibergochi(always(0.1), { day: 19 });
    fibergochi.lookForTerminal();
    expect(fibergochi.picture).toMatch(/^bt\d$/);
    fibergochi.beat();
    expect(fibergochi.hasTerminal).toBe(true);
    fibergochi.browse();
    expect(fibergochi.state.doing).toBe("browsing");
  });

  it("shakes its head at begging, always", () => {
    const fibergochi = new Fibergochi(always(0.5));
    fibergochi.beg();
    expect(fibergochi.picture).toMatch(/^no\d$/);
  });

  it("studies or sleeps, it decides which, and after the exams will do neither", () => {
    const early = new Fibergochi(always(0.2));
    early.studyOrSleep();
    expect(early.state.doing).toBe("studying");
    const late = new Fibergochi(always(0.7));
    late.studyOrSleep();
    expect(late.state.doing).toBe("asleep");
    const after = new Fibergochi(always(0.2), { day: 21 });
    after.studyOrSleep();
    expect(after.picture).toMatch(/^no\d$/);
  });

  it("left alone, is thrown out for boredom before the exams of its first term", () => {
    const fibergochi = new Fibergochi(randomOf(1));
    while (fibergochi.alive) fibergochi.beat();
    expect(fibergochi.state).toMatchObject({ term: 1, day: 15, ended: "bad" });
  });

  it("is thrown out if it is left bored for too long", () => {
    const fibergochi = new Fibergochi(always(0.5), { boredom: 200 });
    fibergochi.beat();
    expect(fibergochi.state.ended).toBe("bad");
    expect(fibergochi.state.said.join("\n")).toContain("Hey, what are you playing at????");
    expect(fibergochi.picture).toBe("x0");
  });
});

describe("the end of a term", () => {
  it("asks how many credits to take next, no more than ten and no more than are left", () => {
    const fibergochi = new Fibergochi(always(0.5), { ...endOf(24), passed: 4 });
    fibergochi.beat();
    expect(fibergochi.state).toMatchObject({ term: 2, left: 5, asks: "enrol" });
    expect(fibergochi.enrolment).toEqual({ most: 5, suggested: 5 });
    expect(fibergochi.enrol(6)).toBe(false);
    expect(fibergochi.enrol(3)).toBe(true);
    expect(fibergochi.state).toMatchObject({ enrolled: 3, asks: null });
  });

  it("stands still while it asks", () => {
    const fibergochi = new Fibergochi(always(0.5), { ...endOf(24), passed: 4 });
    beats(fibergochi, 10);
    expect(fibergochi.clock).toBe("1, 0:00h (2)");
  });

  it("stands still while what it said is unread, as an alert box stopped everything", () => {
    const fibergochi = new Fibergochi(always(0.5), { said: ["BLAM"] });
    beats(fibergochi, 10);
    expect(fibergochi.clock).toBe("1, 0:00h (1)");
    fibergochi.dismiss();
    beats(fibergochi, 3);
    expect(fibergochi.clock).toBe("1, 1:30h (1)");
  });

  it("throws out whoever has passed nothing after two terms: BACARRA", () => {
    const fibergochi = new Fibergochi(always(0.5), { ...endOf(24), term: 2 });
    fibergochi.beat();
    expect(fibergochi.state.ended).toBe("bad");
    expect(fibergochi.state.said).toContain("BACARRA!!!!");
  });

  it("offers the Superior or the Técnica to whoever passes the Fase de Selección, once the news is read", () => {
    const fibergochi = new Fibergochi(always(0.5), { ...endOf(24), term: 2, left: 3, passed: 3 });
    fibergochi.beat();
    expect(fibergochi.state).toMatchObject({ said: ["You have SUCCESSFULLY finished the SELECTION PHASE!!!!!"], asks: "degree", selection: false });
    expect(fibergochi.waiting).toBe(true);
    fibergochi.dismiss();
    expect(fibergochi.state.said).toEqual([]);
    fibergochi.choose("superior");
    expect(fibergochi.state).toMatchObject({ asks: "enrol", left: 100 });
  });

  it("sends to the Técnica whoever is two credits short after four terms, and lets them out of the phase", () => {
    const fibergochi = new Fibergochi(always(0.5), { ...endOf(24), term: 4, left: 3, passed: 1 });
    fibergochi.beat();
    expect(fibergochi.state).toMatchObject({ left: 50, selection: false, asks: "enrol", ended: null });
    expect(fibergochi.state.said.join("\n")).toContain("You have not passed everything, but it is not serious.");
  });

  it("throws out whoever is more than two short after four terms", () => {
    const fibergochi = new Fibergochi(always(0.5), { ...endOf(24), term: 4, left: 5, passed: 1 });
    fibergochi.beat();
    expect(fibergochi.state.ended).toBe("bad");
    expect(fibergochi.state.said).toContain("You have not got through the Selection Phase.");
  });

  it("throws out whoever has four terms of their last six below half the credits taken", () => {
    const fibergochi = new Fibergochi(always(0.5), { ...endOf(24), term: 7, selection: false, left: 40, alfas: [0.4, 0.4, 0.4, 1, 1, 1] });
    fibergochi.beat();
    expect(fibergochi.state.ended).toBe("bad");
    expect(fibergochi.state.said).toContain("You have 4 Alfa parameters below 0.5, bye, bye.");
  });

  it("congratulates whoever finishes the degree, and then crashes, because nobody was expected there", () => {
    const fibergochi = new Fibergochi(always(0.5), { ...endOf(24), term: 12, selection: false, left: 3, passed: 3 });
    fibergochi.beat();
    expect(fibergochi.state.ended).toBe("good");
    expect(fibergochi.state.said.join("\n")).toContain("KERNEL386.EXE");
  });
});

describe("a Fibergochi kept", () => {
  it("comes back as it was left", () => {
    const fibergochi = new Fibergochi(randomOf(7));
    beats(fibergochi, 500);
    const again = new Fibergochi(randomOf(7), fibergochi.state);
    expect(again.state).toEqual(fibergochi.state);
    expect(again.clock).toBe(fibergochi.clock);
  });
});
