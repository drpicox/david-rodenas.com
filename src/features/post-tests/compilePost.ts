export interface Step {
  readonly line: number;
  readonly text: string;
  readonly name: string;
  readonly args: readonly { readonly value: string; readonly name: string }[];
  /** The call as it appears in the test. */
  readonly call: string;
}

export interface Problem {
  readonly line: number;
  readonly message: string;
}

export interface Compiled {
  readonly title: string;
  readonly className: string;
  readonly steps: readonly Step[];
  readonly test: string;
  readonly context: string;
  readonly problems: readonly Problem[];
}

/** A step is a line beginning ` * `, as the template read it; a heading is kept as a comment. */
const STEP = /^\s*\* (.*)$/;
const HEADING = /^#{1,6} /;

/**
 * A step's words become a method name, and what is quoted or a number becomes
 * an argument — the rule of the 2022 template's `MethodStepParser`, kept so
 * that the names here are the names the students saw.
 */
function methodOf(text: string): Pick<Step, "name" | "args"> {
  let name = "";
  const args: { value: string; name: string }[] = [];
  const counts = { s: 0, n: 0 };
  const word = (piece: string) => (name += name === "" ? piece.toLowerCase() : piece[0]!.toUpperCase() + piece.slice(1).toLowerCase());
  const argument = (value: string, hint: "s" | "n") => {
    counts[hint] += 1;
    const expected = /shouldBe/i.test(name) && !args.some((arg) => arg.name === "expected");
    args.push({ value, name: expected ? "expected" : `${hint}${counts[hint]}` });
  };
  const tokens = text.matchAll(/([A-Za-z]+)|("[^"]+")|(\d+)/g);
  for (const [, letters, quoted, digits] of tokens) {
    if (letters) word(letters);
    else if (quoted) (argument(quoted, "s"), word("S"));
    else if (digits) (argument(digits, "n"), word("N"));
  }
  return { name, args };
}

const COMPANIONS = ["there", "is", "are", "has", "have", "need", "needs"];
const has = (text: string, word: string) => new RegExp(`\\b${word}\\b`, "i").test(text);

/** What the template refused, in the order it checked, with what it said back. */
function problemsOf(steps: readonly Step[], lastLine: number): Problem[] {
  if (steps.length === 0) return [{ line: lastLine, message: 'does not have any executable instruction by tests. Post lines that run must begin with " * ".' }];
  if (!steps.some((step) => /should/i.test(step.name))) return [{ line: steps[steps.length - 1]!.line, message: 'does not have any executable instruction that contains "should": at least one line must test that the outcome is the expected.' }];
  for (const step of steps) {
    const companion = COMPANIONS.find((word) => has(step.text, word));
    if (companion && !has(step.text, "given") && !has(step.text, "should")) return [{ line: step.line, message: `has an instruction with the word "${companion}" but no "should" or "given". Add "given" if it sets up, or "should" if it checks a result.` }];
  }
  const both = steps.find((step) => has(step.text, "given") && has(step.text, "should"));
  if (both) return [{ line: both.line, message: 'has an instruction with the word "given" and "should" at the same time. Keep "given" for a setup, "should" for an assertion.' }];
  if (steps.some((step) => step.name === "")) return [{ line: steps.find((step) => step.name === "")!.line, message: "has an instruction with no words in it." }];
  const last = steps[steps.length - 1]!;
  if (!/should/i.test(last.name)) return [{ line: last.line, message: 'the last instruction must contain "should": a post ends by checking what it set out to show.' }];
  return [];
}

/** `2022-07-15_hello_blog.md` → `Post_20220715_HelloBlog_Context`, as `makeJavaName` had it. */
function classNameOf(file: string): string {
  const [date = "", ...rest] = file.replace(/\.md$/, "").split("_");
  return `Post_${date.replace(/-/g, "")}_${rest.map((part) => part[0]!.toUpperCase() + part.slice(1)).join("")}_Context`;
}

/**
 * From a post to the two files the template wrote: the test, which is the
 * post's steps in order and is never edited, and the context, which is the
 * empty methods a student fills in. Pure, so the build can write the first
 * one and the browser can follow every keystroke.
 */
export function compilePost(markdown: string, file: string): Compiled {
  const lines = markdown.replace(/^---[\s\S]*?\n---\n/, (front) => front.replace(/[^\n]/g, "")).split("\n");
  const title = lines.find((line) => /^# /.test(line))?.slice(2).trim() ?? file;
  const className = classNameOf(file);

  const steps: Step[] = [];
  const body: string[] = [];
  lines.forEach((line, index) => {
    const step = STEP.exec(line);
    if (step) {
      const { name, args } = methodOf(step[1] ?? "");
      const call = `${name}(${args.map((arg) => arg.value).join(", ")})`;
      steps.push({ line: index + 1, text: line.trim(), name, args, call });
      body.push(`  await context.${call};\t// ${line.trim()}`);
    } else if (HEADING.test(line)) {
      body.push("", `  // ${line.trim()}`);
    }
  });
  const width = Math.max(0, ...body.map((line) => line.indexOf("\t")));
  const aligned = body.map((line) => (line.includes("\t") ? line.replace("\t", " ".repeat(width - line.indexOf("\t") + 1)) : line));

  const test = [
    "// !!! IMPORTANT !!!",
    "// This test file is AUTOGENERATED by yarn create-tests",
    "// DO NOT MODIFY manually.",
    "",
    `test("${file}", async () => {`,
    `  const context = new ${className}();`,
    "  await context.beforeTest();",
    ...aligned,
    "",
    "  await context.afterTest();",
    "});",
    "",
  ].join("\n");

  const seen = new Set<string>();
  const methods = steps.filter((step) => !seen.has(step.name) && seen.add(step.name));
  const context = [
    `export class ${className} {`,
    "  async beforeTest() {}",
    "",
    ...methods.flatMap((step) => [`  async ${step.name}(${step.args.map((arg) => arg.name).join(", ")}) {`, "    // TODO", "  }", ""]),
    "  async afterTest() {}",
    "}",
    "",
  ].join("\n");

  return { title, className, steps, test, context, problems: problemsOf(steps, lines.length) };
}
