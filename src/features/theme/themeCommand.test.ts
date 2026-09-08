import { describe, expect, it } from "vitest";
import { Site } from "../../platform/content/Site";
import type { ShellContext } from "../../platform/shell/Command";
import { siteCommands } from "../../platform/shell/commands/siteCommands";
import type { Theme } from "./Theme";
import type { ThemeChoice } from "./ThemeChoice";
import { themeCommand } from "./themeCommand";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n" },
  { file: "worlds/index.md", markdown: "---\ntitle: Worlds\ntheme: dark\n---\n" },
]);

/** A theme that keeps its answer in a variable, which is all a test needs one to do. */
function fakeTheme(): Theme & { asked: ThemeChoice[]; settled: "light" | "dark" | "system" } {
  const fake = {
    asked: [] as ThemeChoice[],
    settled: "dark" as "light" | "dark" | "system",
    apply(choice: ThemeChoice) {
      fake.asked.push(choice);
      return fake.settled;
    },
  };
  return fake;
}

function run(theme: Theme, cwd: string, args: readonly string[]) {
  const context: ShellContext = { site, cwd, commands: siteCommands };
  return themeCommand(theme).run(context, args);
}

describe("theme", () => {
  it("asks for a toggle when it is given nothing, and says what it became", () => {
    const theme = fakeTheme();
    expect(run(theme, "/", []).text).toContain("theme: dark");
    expect(theme.asked).toEqual(["toggle"]);
  });

  it("passes a named choice straight through", () => {
    const theme = fakeTheme();
    theme.settled = "light";
    expect(run(theme, "/", ["light"]).text).toContain("theme: light");
    expect(theme.asked).toEqual(["light"]);
  });

  it("takes auto to mean the system's choice", () => {
    const theme = fakeTheme();
    theme.settled = "system";
    expect(run(theme, "/", ["auto"]).text).toContain("theme: system");
    expect(theme.asked).toEqual(["system"]);
  });

  // Whoever can click should not have to know that `theme system` is a thing to type.
  it("offers the choices it did not take, as things to click", () => {
    const theme = fakeTheme();
    theme.settled = "dark";
    const outcome = run(theme, "/", ["dark"]);
    expect(outcome.text).toBe("theme: dark\n  light  system");
    expect(outcome.html).toContain('data-run="theme light"');
    expect(outcome.html).toContain('data-run="theme system"');
    // Not the one it is already on: clicking it would do nothing and say so.
    expect(outcome.html).not.toContain('data-run="theme dark"');
  });

  it("offers the other two when the system is deciding", () => {
    const theme = fakeTheme();
    theme.settled = "system";
    expect(run(theme, "/", ["system"]).text).toBe("theme: system\n  light  dark");
  });

  it("offers nothing to click when it refused", () => {
    const theme = fakeTheme();
    expect(run(theme, "/", ["puce"]).html).toBeUndefined();
    expect(run(theme, "/worlds/", []).html).toBeUndefined();
  });

  it("refuses a choice that is not one, and does not touch the page", () => {
    const theme = fakeTheme();
    const outcome = run(theme, "/", ["puce"]);
    expect(outcome.error).toBe(true);
    expect(outcome.text).toContain("puce");
    expect(theme.asked).toEqual([]);
  });

  // A page that insists on dark is dark for a reason; the reader's choice waits outside it.
  it("refuses on a page that keeps its own, and says which", () => {
    const theme = fakeTheme();
    const outcome = run(theme, "/worlds/", []);
    expect(outcome.error).toBe(true);
    expect(outcome.text).toContain("dark");
    expect(theme.asked).toEqual([]);
  });
});
