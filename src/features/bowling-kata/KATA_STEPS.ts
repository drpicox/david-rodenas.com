import type { KataStep } from "./KataStep";

/*
 * The files at every commit of the JavaScript version of Robert C. Martin's
 * Bowling Game Kata, as David's slides give them ("Bowling Game Kata -
 * JS-ByRefactoring", 2022). Where a slide elides with "..." the part is the one
 * the previous commit left. The slides' own notes are kept in their words.
 * `runKata.test.ts` runs every one of them and checks it goes red or green
 * where the slides say.
 */

const IMPORT = 'import Game from "./bowling";';
const SETUP = `${IMPORT}\n\nlet g;\nbeforeEach(() => (g = new Game()));`;

const gutterGameLoop = (withGame: boolean, expect: boolean, step = "i++") =>
  `test("gutter game", () => {\n${withGame ? "  const g = new Game();\n" : ""}  for (let i = 0; i < 20; ${step})\n    g.roll(0);\n${expect ? "  expect(g.score()).toBe(0);\n" : ""}});`;
const allOnesLoop = (withGame: boolean, step = "i++") =>
  `test("all ones", () => {\n${withGame ? "  const g = new Game();\n" : ""}  for (let i = 0; i < 20; ${step})\n    g.roll(1);\n  expect(g.score()).toBe(20);\n});`;

const GUTTER = 'test("gutter game", () => {\n  rollMany(20, 0);\n  expect(g.score()).toBe(0);\n});';
const ALL_ONES = 'test("all ones", () => {\n  rollMany(20, 1);\n  expect(g.score()).toBe(20);\n});';
const SPARE = 'test("one spare", () => {\n  g.roll(5);\n  g.roll(5); // spare\n  g.roll(3);\n  rollMany(17, 0);\n  expect(g.score()).toBe(16);\n});';
const SPARE_ASIDE = SPARE.split("\n").map((line) => `// ${line}`).join("\n");
const SPARE_BY_NAME = 'test("one spare", () => {\n  rollSpare();\n  g.roll(3);\n  rollMany(17, 0);\n  expect(g.score()).toBe(16);\n});';
const STRIKE = 'test("one strike", () => {\n  g.roll(10); // strike\n  g.roll(3);\n  g.roll(4);\n  rollMany(16, 0);\n  expect(g.score()).toBe(24);\n});';
const STRIKE_BY_NAME = 'test("one strike", () => {\n  rollStrike();\n  g.roll(3);\n  g.roll(4);\n  rollMany(16, 0);\n  expect(g.score()).toBe(24);\n});';
const perfect = (expected: string) => `test("perfect game", () => {\n  rollMany(12, 10);\n  expect(g.score()).toBe(${expected});\n});`;

const ROLL_MANY = "function rollMany(rolls, pins) {\n  for (let i = 0; i < rolls; i += 1)\n    g.roll(pins);\n}";
const ROLL_MANY_SHORT = "function rollMany(rolls, pins) {\n  for (let i = 0; i < rolls; i += 1) g.roll(pins);\n}";
const ROLL_SPARE = "function rollSpare() {\n  g.roll(5);\n  g.roll(5);\n}";
const ROLL_STRIKE = "function rollStrike() {\n  g.roll(10);\n}";

const file = (...parts: string[]) => parts.join("\n\n");

const T = {
  gutterNoImport: "test('gutter game', () => {\n  const g = new Game();\n});",
  gutterNew: file(IMPORT, 'test("gutter game", () => {\n  const g = new Game();\n});'),
  gutterRolls: file(IMPORT, gutterGameLoop(true, false)),
  gutterScore: file(IMPORT, gutterGameLoop(true, true)),
  allOnes: file(IMPORT, gutterGameLoop(true, true), allOnesLoop(true)),
  setUp: file(SETUP, gutterGameLoop(true, true), allOnesLoop(true)),
  gutterShared: file(SETUP, gutterGameLoop(false, true), allOnesLoop(true)),
  bothShared: file(SETUP, gutterGameLoop(false, true), allOnesLoop(false)),
  named: file(
    SETUP,
    'test("gutter game", () => {\n  const pins = 0;\n  const rolls = 20;\n  for (let i = 0; i < rolls; i += 1)\n    g.roll(pins);\n  expect(g.score()).toBe(0);\n});',
    allOnesLoop(false, "i += 1"),
  ),
  extracted: file(SETUP, 'test("gutter game", () => {\n  const pins = 0;\n  const rolls = 20;\n  rollMany(rolls, pins);\n  expect(g.score()).toBe(0);\n});', allOnesLoop(false, "i += 1"), ROLL_MANY),
  inlined: file(SETUP, GUTTER, allOnesLoop(false, "i += 1"), ROLL_MANY),
  rollMany: file(SETUP, GUTTER, ALL_ONES, ROLL_MANY),
  spare: file(SETUP, GUTTER, ALL_ONES, SPARE, ROLL_MANY),
  spareAside: file(SETUP, GUTTER, ALL_ONES, SPARE_ASIDE, ROLL_MANY),
  rollSpare: file(SETUP, GUTTER, ALL_ONES, SPARE_BY_NAME, ROLL_MANY_SHORT, ROLL_SPARE),
  strike: file(SETUP, GUTTER, ALL_ONES, SPARE_BY_NAME, STRIKE, ROLL_MANY_SHORT, ROLL_SPARE),
  rollStrike: file(SETUP, GUTTER, ALL_ONES, SPARE_BY_NAME, STRIKE_BY_NAME, ROLL_MANY_SHORT, ROLL_SPARE, ROLL_STRIKE),
  perfect: file(SETUP, GUTTER, ALL_ONES, SPARE_BY_NAME, STRIKE_BY_NAME, perfect("300"), ROLL_MANY_SHORT, ROLL_SPARE, ROLL_STRIKE),
  perfectFails: file(SETUP, GUTTER, ALL_ONES, SPARE_BY_NAME, STRIKE_BY_NAME, perfect('"fail"'), ROLL_MANY_SHORT, ROLL_SPARE, ROLL_STRIKE),
};

const game = (...members: string[]) => `export default class Game {\n${members.join("\n")}\n}`;
const method = (name: string, ...body: string[]) => (body.length ? `  ${name} {\n${body.map((line) => `    ${line}`).join("\n")}\n  }` : `  ${name} {}`);
const sumLoop = ["let score = 0;", "for (let i = 0; i < this.#rolls.length; i++) {", "  score += this.#rolls[i];", "}", "return score;"];
const frames = (...branch: string[]) => [
  "const rolls = this.#rolls;",
  "let score = 0;",
  ...branch,
  "return score;",
];
const ROLLS_FIELD = "  #rolls = [];";
const PUSH = method("roll(pins)", "this.#rolls.push(pins);");

const IS_SPARE = "function isSpare(rolls, frameIndex) {\n  return rolls[frameIndex] + rolls[frameIndex + 1] == 10;\n}";
const IS_STRIKE = "function isStrike(rolls, frameIndex) {\n  return rolls[frameIndex] === 10;\n}";
const STRIKE_BONUS = "function strikeBonus(rolls, frameIndex) {\n  return rolls[frameIndex + 1] + rolls[frameIndex + 2];\n}";
const SPARE_BONUS = "function spareBonus(rolls, frameIndex) {\n  return rolls[frameIndex + 2];\n}";
const SUM_OF_BALLS = "function sumOfBallsInFrame(rolls, frameIndex) {\n  return rolls[frameIndex] + rolls[frameIndex + 1];\n}";

const frameLoop = (lines: readonly string[]) => ["let frameIndex = 0;", "for (let frame = 0; frame < 10; frame++) {", ...lines.map((line) => `  ${line}`), "}"];
const spareThenOpen = (spare: string, open: string) => [
  `if (${spare}) {`,
  ...(spare.includes("isSpare") ? [] : ["  // spare"]),
  "  score += 10 + rolls[frameIndex + 2];",
  "  frameIndex += 2;",
  "} else {",
  `  score += ${open};`,
  "  frameIndex += 2;",
  "}",
];

const C = {
  none: "",
  empty: "export default class Game {}",
  roll: game(method("roll()")),
  scoreEmpty: game(method("roll()"), method("score()")),
  scoreZero: game(method("roll()"), method("score()", "return 0;")),
  summing: game("  #score = 0;", method("roll(pins)", "this.#score += pins;"), method("score()", "return this.#score;")),
  rollsField: game("  #score = 0;", ROLLS_FIELD, method("roll(pins)", "this.#score += pins;"), method("score()", "return this.#score;")),
  bothWritten: game("  #score = 0;", ROLLS_FIELD, method("roll(pins)", "this.#score += pins;", "this.#rolls.push(pins);"), method("score()", "return this.#score;")),
  readFromRolls: game("  #score = 0;", ROLLS_FIELD, method("roll(pins)", "this.#score += pins;", "this.#rolls.push(pins);"), method("score()", ...sumLoop)),
  oldUnwritten: game("  #score = 0;", ROLLS_FIELD, PUSH, method("score()", ...sumLoop)),
  rollsOnly: game(ROLLS_FIELD, PUSH, method("score()", ...sumLoop)),
  twoAtATime: game(
    ROLLS_FIELD,
    PUSH,
    method("score()", "const rolls = this.#rolls;", "let score = 0;", "let i = 0;", "for (let frame = 0; frame < 10; frame++) {", "  score += rolls[i] + rolls[i + 1];", "  i += 2;", "}", "return score;"),
  ),
  spareByI: game(
    ROLLS_FIELD,
    PUSH,
    method(
      "score()",
      "const rolls = this.#rolls;",
      "let score = 0;",
      "let i = 0;",
      "for (let frame = 0; frame < 10; frame++) {",
      "  if (rolls[i] + rolls[i + 1] == 10) {",
      "    // spare",
      "    score += 10 + rolls[i + 2];",
      "    i += 2;",
      "  } else {",
      "    score += rolls[i] + rolls[i + 1];",
      "    i += 2;",
      "  }",
      "}",
      "return score;",
    ),
  ),
  frameIndex: game(ROLLS_FIELD, PUSH, method("score()", ...frames(...frameLoop(spareThenOpen("rolls[frameIndex] + rolls[frameIndex + 1] == 10", "rolls[frameIndex] + rolls[frameIndex + 1]"))))),
  isSpare: `${game(ROLLS_FIELD, PUSH, method("score()", ...frames(...frameLoop(spareThenOpen("isSpare(rolls, frameIndex)", "rolls[frameIndex] + rolls[frameIndex + 1]")))))}\n\n${IS_SPARE}`,
  strike: `${game(
    ROLLS_FIELD,
    PUSH,
    method(
      "score()",
      ...frames(
        ...frameLoop([
          "if (rolls[frameIndex] == 10) {",
          "  // strike",
          "  score += 10 +",
          "    rolls[frameIndex + 1] +",
          "    rolls[frameIndex + 2];",
          "  frameIndex += 1;",
          "} else if (isSpare(rolls, frameIndex)) {",
          "  score += 10 + rolls[frameIndex + 2];",
          "  frameIndex += 2;",
          "} else {",
          "  score += rolls[frameIndex] + rolls[frameIndex + 1];",
          "  frameIndex += 2;",
          "}",
        ]),
      ),
    ),
  )}\n\n${IS_SPARE}`,
  strikeBonus: `${game(
    ROLLS_FIELD,
    PUSH,
    method(
      "score()",
      ...frames(
        ...frameLoop([
          "if (rolls[frameIndex] == 10) {",
          "  // strike",
          "  score += 10 + strikeBonus(rolls, frameIndex);",
          "  frameIndex += 1;",
          "} else if (isSpare(rolls, frameIndex)) {",
          "  score += 10 + rolls[frameIndex + 2];",
          "  frameIndex += 2;",
          "} else {",
          "  score += rolls[frameIndex]+rolls[frameIndex + 1];",
          "  frameIndex += 2;",
          "}",
        ]),
      ),
    ),
  )}\n\n${STRIKE_BONUS}\n\n${IS_SPARE}`,
  spareBonus: `${game(
    ROLLS_FIELD,
    PUSH,
    method(
      "score()",
      ...frames(
        ...frameLoop([
          "if (rolls[frameIndex] == 10) {",
          "  // strike",
          "  score += 10 + strikeBonus(rolls, frameIndex);",
          "  frameIndex += 1;",
          "} else if (isSpare(rolls, frameIndex)) {",
          "  score += 10 + spareBonus(rolls, frameIndex);",
          "  frameIndex += 2;",
          "} else {",
          "  score += rolls[frameIndex]+rolls[frameIndex + 1];",
          "  frameIndex += 2;",
          "}",
        ]),
      ),
    ),
  )}\n\n${STRIKE_BONUS}\n\n${SPARE_BONUS}\n\n${IS_SPARE}`,
  sumOfBalls: `${game(
    ROLLS_FIELD,
    PUSH,
    method(
      "score()",
      ...frames(
        ...frameLoop([
          "if (rolls[frameIndex] == 10) {",
          "  // strike",
          "  score += 10 + strikeBonus(rolls, frameIndex);",
          "  frameIndex += 1;",
          "} else if (isSpare(rolls, frameIndex)) {",
          "  score += 10 + spareBonus(rolls, frameIndex);",
          "  frameIndex += 2;",
          "} else {",
          "  score += sumOfBallsInFrame(rolls, frameIndex);",
          "  frameIndex += 2;",
          "}",
        ]),
      ),
    ),
  )}\n\n${STRIKE_BONUS}\n\n${SPARE_BONUS}\n\n${SUM_OF_BALLS}\n\n${IS_SPARE}`,
  isStrike: `${game(
    ROLLS_FIELD,
    PUSH,
    method(
      "score()",
      ...frames(
        ...frameLoop([
          "if (isStrike(rolls, frameIndex)) {",
          "  score += 10 + strikeBonus(rolls, frameIndex);",
          "  frameIndex += 1;",
          "} else if (isSpare(rolls, frameIndex)) {",
          "  score += 10 + spareBonus(rolls, frameIndex);",
          "  frameIndex += 2;",
          "} else {",
          "  score += sumOfBallsInFrame(rolls, frameIndex);",
          "  frameIndex += 2;",
          "}",
        ]),
      ),
    ),
  )}\n\n${IS_STRIKE}\n\n${STRIKE_BONUS}\n\n${SPARE_BONUS}\n\n${SUM_OF_BALLS}\n\n${IS_SPARE}`,
};

const LOOPS = ["Roll loop is duplicated", "Game creation duplicated"];
const TEST_COMMENT = ["ugly comment in test."];
const THREE = ["ugly comment in test.", "ugly comment in conditional.", "i is a bad name for this variable"];
const EXPRESSIONS = ["ugly comment in test.", "ugly comment in conditional.", "ugly expressions."];

const step = (commit: number, stage: KataStep["stage"], test: string, code: string, smells: readonly string[] = [], note?: string): KataStep =>
  note === undefined ? { commit, stage, test, code, smells } : { commit, stage, test, code, smells, note };

export const KATA_STEPS: readonly KataStep[] = [
  step(0, "test", "", C.none, [], "Create the BowlingGame project. Create a test file bowling.spec.js. Execute the test and verify that you get the following error."),
  step(1, "test", T.gutterNoImport, C.none),
  step(2, "code", T.gutterNew, C.empty),
  step(3, "test", T.gutterRolls, C.empty),
  step(4, "code", T.gutterRolls, C.roll),
  step(5, "test", T.gutterScore, C.roll),
  step(6, "code", T.gutterScore, C.scoreEmpty),
  step(7, "code", T.gutterScore, C.scoreZero),
  step(8, "test", T.allOnes, C.scoreZero, LOOPS),
  step(9, "code", T.allOnes, C.summing, LOOPS),
  step(10, "clean", T.setUp, C.summing, LOOPS),
  step(11, "clean", T.gutterShared, C.summing, LOOPS),
  step(12, "clean", T.bothShared, C.summing, LOOPS),
  step(13, "clean", T.named, C.summing, LOOPS),
  step(14, "clean", T.extracted, C.summing, LOOPS),
  step(15, "clean", T.inlined, C.summing, LOOPS),
  step(16, "clean", T.rollMany, C.summing, LOOPS),
  step(17, "test", T.spare, C.summing, TEST_COMMENT),
  step(
    18,
    "test",
    T.spareAside,
    C.summing,
    TEST_COMMENT,
    "Tempted to use flag to remember previous roll. So design must be wrong. roll() calculates score, but name does not imply that. score() does not calculate score, but name implies that it does. Design is wrong. Responsibilities are misplaced.",
  ),
  step(19, "clean", T.spareAside, C.rollsField, TEST_COMMENT),
  step(20, "clean", T.spareAside, C.bothWritten, TEST_COMMENT),
  step(21, "clean", T.spareAside, C.readFromRolls, TEST_COMMENT),
  step(22, "clean", T.spareAside, C.oldUnwritten, TEST_COMMENT),
  step(23, "clean", T.spareAside, C.rollsOnly, TEST_COMMENT),
  step(24, "test", T.spare, C.rollsOnly, TEST_COMMENT),
  step(
    25,
    "test",
    T.spareAside,
    C.rollsOnly,
    TEST_COMMENT,
    "This isn’t going to work because i might not refer to the first ball of the frame. Design is still wrong. Need to walk through array two balls (one frame) at a time.",
  ),
  step(26, "clean", T.spareAside, C.twoAtATime, TEST_COMMENT),
  step(27, "test", T.spare, C.twoAtATime, TEST_COMMENT),
  step(28, "code", T.spare, C.spareByI, TEST_COMMENT),
  step(29, "clean", T.spare, C.frameIndex, THREE),
  step(30, "clean", T.spare, C.isSpare, THREE),
  step(31, "clean", T.rollSpare, C.isSpare, THREE),
  step(32, "test", T.strike, C.isSpare, TEST_COMMENT),
  step(33, "code", T.strike, C.strike, TEST_COMMENT),
  step(34, "clean", T.strike, C.strikeBonus, EXPRESSIONS),
  step(35, "clean", T.strike, C.spareBonus, EXPRESSIONS),
  step(36, "clean", T.strike, C.sumOfBalls, EXPRESSIONS),
  step(37, "clean", T.strike, C.isStrike, EXPRESSIONS),
  step(38, "clean", T.rollStrike, C.isStrike, EXPRESSIONS),
  step(39, "test", T.perfect, C.isStrike),
  step(40, "test", T.perfectFails, C.isStrike),
  step(41, "test", T.perfect, C.isStrike),
];
