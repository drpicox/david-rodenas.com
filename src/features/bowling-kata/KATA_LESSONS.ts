import type { KataLesson } from "./KataLesson";

const WHAT_TO_TEST = { id: "fc771d5e39e8", title: "Lessons Learned From The Bowling Game Kata: What To Test?" };
const REFACTOR_1 = { id: "90b110a2ad17", title: "Refactor Lessons Learned From The Bowling Game Kata (1/2)" };
const REFACTOR_2 = { id: "1d28b3a78b08", title: "Refactor Lessons Learned From The Bowling Game Kata (2/2)" };
const HOW_TO_DESIGN = { id: "a37d8d11be9c", title: "Lessons Learned From The Bowling Game Kata: How To Design?" };
const DONT_TRUST_TESTS = { id: "6813582074f3", title: "Don't Trust Tests" };

/**
 * My essays on the kata, commit by commit: each lesson in a few words of its
 * own essay, and the section that tells it at length. Every one was checked
 * against its essay and against the files at the commit it lands on; the
 * lines of those essays that credit someone wrongly, or lean on a figure,
 * are not here.
 */
export const KATA_LESSONS: readonly KataLesson[] = [
  {
    commits: [1, 4],
    title: "Step tests come and go",
    text: "The test first only creates a game, as a step test would, and then rolls, as another would. Such tests appear and disappear while a business test is written: none is needed.",
    essay: { ...WHAT_TO_TEST, section: "Chapter Four. Step tests are redundant." },
  },
  {
    commits: [5, 7],
    title: "The simplest rule first",
    text: "The gutter game scores no point, so it needs no hard thinking, and it lays the foundation of the code. Then comes the simplest rule that remains, and so on.",
    essay: { ...WHAT_TO_TEST, section: "Chapter Seven. Start with the most simple rule." },
  },
  {
    commits: [8, 9],
    title: "Refactor only after it works",
    text: "The second test repeats code from the first, and the kata waits: it only marks the duplication. Solving the problem and cleaning the code are two tasks, and the first comes first.",
    essay: { ...REFACTOR_1, section: "Lesson 1: Refactor only after it works." },
  },
  {
    commits: [10, 10],
    title: "Add new code before removing the old",
    text: "It works again, so the refactor begins, oddly: a game for every test, kept and then ignored. Doing nothing, it breaks nothing — which shows the new code is safe to use.",
    essay: { ...REFACTOR_1, section: "Lesson 2: Add new code before removing old." },
  },
  {
    commits: [11, 12],
    title: "Remove as little as possible",
    text: "The old creation goes one test at a time: the gutter game first, then, once everything works, all ones. Should they behave differently, a small change makes the cause easy to find.",
    essay: { ...REFACTOR_1, section: "Lesson 3: Remove the minimal amount of old code." },
  },
  {
    commits: [13, 13],
    title: "One aspect at a time",
    text: "Only with the game's creation clean does the kata turn to the other thing to clean, the repeated loop. Many improvements may come to mind; it takes them one at a time.",
    essay: { ...REFACTOR_1, section: "Lesson 4: Refactor only one aspect at a time." },
  },
  {
    commits: [14, 16],
    title: "Let the IDE do it",
    text: "With the rolls and the pins in constants, extracting the loop makes them the parameters of rollMany, and nothing is done by hand. Then the constants go, and the second loop calls it too.",
    essay: { ...REFACTOR_1, section: "Lesson 5: Leverage on the IDE." },
  },
  {
    commits: [17, 17],
    title: "Not from scratch",
    text: "The design so far is the least one the needs so far asked for, and it was necessary. Now it no longer serves, and starting again from scratch is out of the question.",
    essay: { ...REFACTOR_2, section: "The Final Lesson" },
  },
  {
    commits: [18, 18],
    title: "Step 0 · Name the parts",
    text: "The failing test is set aside, so everything works again before the refactor. Then the kinds of code: the counter is the internal representation, roll its setter, score its getter.",
    essay: { ...REFACTOR_2, section: "Step 0. Identifying types of code" },
  },
  {
    commits: [19, 19],
    title: "Step 1 · Add the new beside the old",
    text: "The new internal representation, the list of rolls, goes in just below the counter. The old one is not removed, so the code still works.",
    essay: { ...REFACTOR_2, section: "Step 1. Introducing the new internal representation" },
  },
  {
    commits: [20, 20],
    title: "Step 2 · Write to both",
    text: "The setter, roll, also keeps each roll in the list. It goes on updating the counter as well, so for now it writes to both, and the code still works.",
    essay: { ...REFACTOR_2, section: "Step 2. Make setters update the new internal representation." },
  },
  {
    commits: [21, 21],
    title: "Step 3 · Read from the new",
    text: "The getter, score, now adds up the list. Only its own old line goes: that breaks nobody, and an undo would bring it back. The counter and its update stay.",
    essay: { ...REFACTOR_2, section: "Step 3. Make getters use the new internal representation." },
  },
  {
    commits: [22, 22],
    title: "Step 4 · Stop writing the old",
    text: "roll stops updating the counter, and everything works: no getter reads it any more. Had something broken, some code would still be using it: undo the removal, and keep refactoring.",
    essay: { ...REFACTOR_2, section: "The Five Steps" },
  },
  {
    commits: [23, 23],
    title: "Step 5 · Remove the old",
    text: "Nobody uses the counter, so it goes, and the code works again — the mantra behind each step. So every step could be committed and merged, without stopping delivery.",
    essay: { ...REFACTOR_2, section: "The five steps mantra" },
  },
  {
    commits: [24, 26],
    title: "No guarantee of success",
    text: "The refactor is complete, and the spare still fails: a good technique is not a guarantee. It works again first; then most of the code stays, and only the algorithm changes.",
    essay: { ...REFACTOR_2, section: "Additional steps." },
  },
  {
    commits: [27, 27],
    title: "The test comes back as it was",
    text: "The spare test returns unchanged; the kata writes no test for its roll-by-roll attempt. It just continues the refactor, and fixes the algorithm.",
    essay: { ...WHAT_TO_TEST, section: "Chapter Five. Do not test mistakes." },
  },
  {
    commits: [32, 32],
    title: "The tests are the rules",
    text: "The strike test is one more rule of scoring: tests and rules match one by one. They call the game, roll and score, and what they test is the business rules.",
    essay: { ...WHAT_TO_TEST, section: "Chapter One. The basics." },
  },
  {
    commits: [37, 37],
    title: "Code that reads as the rules",
    text: "The score now reads as the instructions for scoring bowling: frame by frame, a strike, a spare or neither, with the bonuses where they are due.",
    essay: { ...HOW_TO_DESIGN, section: "Comparing typical design with the kata design" },
  },
  {
    commits: [39, 39],
    title: "No code for the tenth frame",
    text: "The perfect game passes at once. The tenth frame has no code and no test of its own: this game checks it, and the bonuses count its extra rolls.",
    essay: { ...HOW_TO_DESIGN, section: "Where is the Tenth Frame?" },
  },
  {
    commits: [40, 40],
    title: "Make it fail once",
    text: "A test that passes without failing first has lost what TDD gives: a mistake could pass unnoticed. So it is made to fail on purpose, and the error shows it checks the right thing.",
    essay: { ...DONT_TRUST_TESTS, section: "" },
  },
  {
    commits: [41, 41],
    title: "Trust a test seen failing",
    text: "Seen failing as it should, the test is known to check the right thing, and it gets its expectation back. Never trust a test that did not fail before.",
    essay: { ...DONT_TRUST_TESTS, section: "" },
  },
];
