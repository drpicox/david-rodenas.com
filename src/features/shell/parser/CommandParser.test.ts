import { CommandParser } from "./CommandParser";

test("help simple command", () => {
  const parser = new CommandParser("test", "a test command");
  const help = parser.getHelp();
  expect(help.split("\n")).toEqual([
    "test: a test command",
    "",
    "Usage: test",
    "",
    "Arguments:",
    "  No arguments expected for this command.",
    "",
    "Options:",
    "  No options available for this command.",
    "",
  ]);
});

test("help command with an argument", () => {
  const parser = new CommandParser("test", "a test command with an argument")
    .argument("one", "the one argument")
    .argument("<req>", "the required argument")
    .argument("[opt]", "the optional argument")
    .argument("def", "the argument with a default value", { default: "hi" });
  const help = parser.getHelp();
  expect(help.split("\n")).toEqual([
    "test: a test command with an argument",
    "",
    "Usage: test <one> <req> [opt] [def]",
    "",
    "Arguments:",
    "  <one>  the one argument",
    "  <req>  the required argument",
    "  [opt]  the optional argument",
    "  [def]  the argument with a default value (default: hi)",
    "",
    "Options:",
    "  No options available for this command.",
    "",
  ]);
});

test("help command with an option", () => {
  const parser = new CommandParser("test", "a test command with an option")
    .option("-o", "the one option")
    .option("-l, --list", "a list")
    .option("--long", "the long option");
  const help = parser.getHelp();
  expect(help.split("\n")).toEqual([
    "test: a test command with an option",
    "",
    "Usage: test [-lo] [--list] [--long]",
    "",
    "Arguments:",
    "  No arguments expected for this command.",
    "",
    "Options:",
    "  -o          the one option",
    "  -l, --list  a list",
    "  --long      the long option",
    "",
  ]);
});

test.each`
  command               | options                  | args                 | expected
  ${"test"}             | ${[]}                    | ${[]}                | ${{ success: true }}
  ${"test"}             | ${["-a"]}                | ${[]}                | ${{ options: { "-a": false } }}
  ${"test -a"}          | ${["-a"]}                | ${[]}                | ${{ success: true }}
  ${"test -a"}          | ${["-a"]}                | ${[]}                | ${{ options: { "-a": true } }}
  ${"test -b"}          | ${["-a", "-b"]}          | ${[]}                | ${{ options: { "-a": false, "-b": true } }}
  ${"test -a -b"}       | ${["-a", "-b"]}          | ${[]}                | ${{ options: { "-a": true, "-b": true } }}
  ${"test -ab"}         | ${["-a", "-b"]}          | ${[]}                | ${{ options: { "-a": true, "-b": true } }}
  ${"test -a"}          | ${["-a, -b"]}            | ${[]}                | ${{ options: { "-a": true } }}
  ${"test -a"}          | ${["-a, -b"]}            | ${[]}                | ${{ options: { "-a": true, "-b": true } }}
  ${"test -b"}          | ${["-a, -b"]}            | ${[]}                | ${{ options: { "-a": true, "-b": true } }}
  ${"test -c"}          | ${["-a", "-b"]}          | ${[]}                | ${{ success: false, error: "illegal option -c" }}
  ${"test --hello"}     | ${["--hello"]}           | ${[]}                | ${{ success: true }}
  ${"test --hello"}     | ${["--hello"]}           | ${[]}                | ${{ options: { "--hello": true } }}
  ${"test --hello"}     | ${["-h, --hello"]}       | ${[]}                | ${{ options: { "-h": true, "--hello": true } }}
  ${"test -h"}          | ${["-h, --hello"]}       | ${[]}                | ${{ options: { "-h": true, "--hello": true } }}
  ${"test -ah"}         | ${["-a", "-h, --hello"]} | ${[]}                | ${{ options: { "-a": true, "-h": true, "--hello": true } }}
  ${"test --wrong"}     | ${["-h, --hello"]}       | ${[]}                | ${{ success: false, error: "illegal option --wrong" }}
  ${"test hello"}       | ${[]}                    | ${["arg"]}           | ${{ success: true }}
  ${"test hello"}       | ${[]}                    | ${["arg"]}           | ${{ args: { arg: "hello" } }}
  ${"test hello world"} | ${[]}                    | ${["arg"]}           | ${{ success: false, error: "too many arguments" }}
  ${"test"}             | ${[]}                    | ${["arg"]}           | ${{ success: false, error: "missing required argument <arg>" }}
  ${"test hello world"} | ${[]}                    | ${["a1", "a2"]}      | ${{ args: { a1: "hello", a2: "world" } }}
  ${"test"}             | ${[]}                    | ${["[arg]=hi"]}      | ${{ success: true }}
  ${"test"}             | ${[]}                    | ${["[arg]=hi"]}      | ${{ args: { arg: "hi" } }}
  ${"test hello"}       | ${[]}                    | ${["a1", "[a2]"]}    | ${{ success: true }}
  ${"test hello"}       | ${[]}                    | ${["a1", "[a2]=hi"]} | ${{ args: { a1: "hello", a2: "hi" } }}
  ${"test -a hello -b"} | ${["-a", "-b"]}          | ${["a1", "[a2]=hi"]} | ${{ args: { a1: "hello", a2: "hi" }, options: { "-a": true, "-b": true } }}
  ${"test -- hello"}    | ${[]}                    | ${["arg"]}           | ${{ success: true }}
  ${"test -- hello"}    | ${[]}                    | ${["arg"]}           | ${{ args: { arg: "hello" } }}
  ${"test -- -world"}   | ${[]}                    | ${["arg"]}           | ${{ success: true }}
  ${"test -- -hi"}      | ${[]}                    | ${["arg"]}           | ${{ args: { arg: "-hi" } }}
  ${"test -- -a"}       | ${["-a"]}                | ${["arg"]}           | ${{ args: { arg: "-a" }, options: { "-a": false } }}
  ${"test --"}          | ${[]}                    | ${["[arg]=hi"]}      | ${{ args: { arg: "hi" } }}
`(
  "parse $command with $options and $args",
  ({ command, options, args, expected }) => {
    let parser = new CommandParser("test", "a test command");
    for (const option of options) {
      parser = parser.option(option, "option");
    }
    for (const arg of args) {
      const [name, defaultValue] = arg.split("=");
      parser = parser.argument(name, "arg", { default: defaultValue });
    }

    const result = parser.parse(command.split(" "));

    if (typeof expected.success === "boolean") {
      expect(result.isSuccess()).toBe(expected.success);
    }
    if (typeof expected.error === "string") {
      expect(result.getError()).toBe(expected.error);
    }

    if (typeof expected.options === "object") {
      for (const [option, value] of Object.entries(expected.options)) {
        expect(result.getOption(option)).toEqual(value);
      }
    }

    if (typeof expected.args === "object") {
      for (const [arg, value] of Object.entries(expected.args)) {
        expect(result.getArgument(arg)).toEqual(value);
      }
    }
  },
);

test("show the error message when the command is not successful", () => {
  const parser = new CommandParser("test", "a test command")
    .option("-a, --after", "the one option")
    .option("-b", "the other option")
    .argument("arg", "the argument")
    .argument("[arg2]", "the optional argument");

  const result = parser.parse(["test", "--wrong"]);
  expect(result.isSuccess()).toBe(false);
  expect(result.getErrorMessage().split("\n")).toEqual([
    "test: missing required argument <arg>",
    "usage: test [-ab] [--after] <arg> [arg2]",
  ]);
});
