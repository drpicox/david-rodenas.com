/**
 * Everything a Fibergochi is, and all that is kept of it between visits. In
 * 1999 it was fifty numbers of four characters each, packed into the one
 * cookie; the ones it counted and never read — humour, life, exams — are
 * left out.
 */
export interface FibergochiState {
  /** The step within the hour, three to an hour. */
  readonly step: number;
  readonly hour: number;
  readonly day: number;
  readonly term: number;
  readonly doing: "idle" | "asleep" | "studying" | "browsing" | "looking" | "lab" | "bar" | "friends";
  readonly boredom: number;
  /** Looking for terminals and begging add to it, the bar takes it away; past a hundred, it leaves. */
  readonly stress: number;
  /**
   * Its habits: how much it has lately worked at labs, studied, chatted and
   * been to the bar, each a tenth less every day. What it does often, it
   * goes back to on its own.
   */
  readonly labHabit: number;
  readonly studyHabit: number;
  readonly chatHabit: number;
  readonly barHabit: number;
  /** Up to a hundred; with few, it does not stay long at the bar. */
  readonly friends: number;
  readonly sleep: number;
  /** Steps left at the terminal it holds; none if it holds none. */
  readonly terminal: number;
  /** The steps of study each subject still needs to pass its exam, one to a credit, the easiest first. */
  readonly exams: readonly number[];
  /** And of work at a terminal, to pass its lab. */
  readonly labs: readonly number[];
  readonly enrolled: number;
  readonly passed: number;
  readonly left: number;
  /** In the Fase de Selección, which it is given four terms to get through. */
  readonly selection: boolean;
  /** Credits passed over credits taken, for each of the last six terms. */
  readonly alfas: readonly number[];
  readonly asks: "enrol" | "degree" | null;
  readonly suggested: number;
  readonly ended: "good" | "bad" | null;
  /** What it has said and has not been read yet, the oldest first: in 1999, each was an alert box. */
  readonly said: readonly string[];
}
