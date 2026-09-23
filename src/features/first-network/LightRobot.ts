import { randomOf } from "../../platform/random/randomOf";
import type { Rule } from "./Rule";

const ROWS = 25;
const COLUMNS = 80;

/**
 * `ROBOT2.BAS`, 7 April 1995, sub for sub. A robot on a text screen with two
 * motors, one for rows (`x`) and one for columns (`y`), and two scanners that
 * say whether the light is below or above it, and right or left. Each motor
 * has a rule to learn for each scanner, four in all, and until they are all
 * written it experiments: one motor at a time, a random step for five turns,
 * and if a step brought it closer it writes down what the scanners read and
 * what the motor did. Then it stops experimenting and follows the rules.
 *
 * The names are the program's in English; the comments name the QBasic.
 */
export class LightRobot {
  private readonly rnd: () => number;
  x: number;
  y: number;
  lx: number;
  ly: number;
  /** `W(0..1, i, j)`: rules[motor][scanner], null while the program still held its 2 for "unknown". */
  rules: (Rule | null)[][] = [
    [null, null],
    [null, null],
  ];
  /** `Am`: what each motor does this turn, -1, 0 or 1. */
  motors = [0, 0];
  /** `Ae`: what each scanner reads, 1, -1, or 0 when level with the light. */
  scanners = [0, 0];
  /** `Test`: the motor being tried. */
  testing = 0;
  /** `Inc`: turns left in the current try. */
  trying = 0;
  /** `Quieto`, toggled by Q — named backwards in the original: when true the light moves. */
  wanders = false;
  /** `Lia`, toggled by L: leave the screen on one side, come back on the other. */
  wraps = false;
  /** `AD` in `Bo`: the distance at the last look. */
  private before = 0;
  /** `Canvi, mx, my` in `MouLlum`: how long the light keeps its heading, and the heading. */
  private light = { turns: 0, dx: 0, dy: 0 };

  constructor(seed: number) {
    this.rnd = randomOf(seed);
    this.x = this.int(ROWS) + 1;
    this.y = this.int(COLUMNS) + 1;
    this.lx = this.int(ROWS) + 1;
    this.ly = this.int(COLUMNS) + 1;
  }

  /** `INT(RND * n)` */
  private int(n: number): number {
    return Math.floor(this.rnd() * n);
  }

  get learning(): boolean {
    return this.rules.flat().some((rule) => rule === null);
  }

  /** One turn of the main loop: the light, the scanners, learning, deciding, moving. */
  tick(): void {
    this.moveLight();
    [this.lx, this.ly] = this.keep(this.lx, this.ly);
    this.scan();
    this.learn();
    this.decide();
    this.x += this.motors[0]!;
    this.y += this.motors[1]!;
    [this.x, this.y] = this.keep(this.x, this.y);
  }

  /** `MouLlum`: a new heading every few turns, taken only if the light wanders. */
  private moveLight(): void {
    if (this.light.turns > 0) this.light.turns -= 1;
    else this.light = { turns: this.rnd() * 20, dx: this.int(3) - 1, dy: this.int(3) - 1 };
    if (this.wanders) {
      this.lx += this.light.dx;
      this.ly += this.light.dy;
    }
  }

  /** `Comprueba` */
  private keep(x: number, y: number): [number, number] {
    if (this.wraps) return [x < 1 ? ROWS : x > ROWS ? 1 : x, y < 1 ? COLUMNS : y > COLUMNS ? 1 : y];
    return [Math.min(Math.max(x, 1), ROWS), Math.min(Math.max(y, 1), COLUMNS)];
  }

  /** `PonSensores` */
  private scan(): void {
    this.scanners = [Math.sign(this.lx - this.x), Math.sign(this.ly - this.y)];
  }

  /** `Bo`: 1 if closer than at the last look — or on the light itself. */
  private closer(): boolean {
    const now = Math.hypot(this.x - this.lx, this.y - this.ly);
    const closer = now < this.before || (now === this.before && now === 0);
    this.before = now;
    return closer;
  }

  /** `Aprende` */
  private learn(): void {
    if (!this.learning) {
      this.testing = 0;
      return;
    }
    const motor = this.testing;
    const closer = this.closer();
    for (let scanner = 0; scanner < 2; scanner += 1) {
      if (closer && this.rules[motor]![scanner] === null) {
        this.rules[motor]![scanner] = { reading: this.scanners[scanner]!, move: this.motors[motor]! };
        this.trying = 0;
      }
    }
    if (this.trying > 0) this.trying -= 1;
    else {
      this.trying = 5;
      this.motors[this.testing] = 0;
      this.testing = this.int(2);
      this.motors[this.testing] = this.int(3) - 1;
    }
  }

  /** `Muevete`: each motor adds the moves of the rules whose reading it sees now, and never goes faster than one. */
  private decide(): void {
    if (this.learning) return;
    this.motors = this.rules.map((rules) => {
      let move = 0;
      rules.forEach((rule, scanner) => {
        if (rule && rule.reading === this.scanners[scanner]) move += rule.move;
      });
      return Math.sign(move);
    });
  }
}
