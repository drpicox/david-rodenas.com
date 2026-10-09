import { describe, expect, it } from "vitest";
import { Site } from "../../platform/content/Site";
import { searchCommand } from "./searchCommand";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n# Home\n" },
  { file: "projects/index.md", markdown: "---\ntitle: Projects\n---\n# Projects\n" },
  { file: "projects/hot-nights.md", markdown: "---\ntitle: Hot nights, counted\nsummary: How many nights never cool.\n---\n# Hot nights\n\nA torrid night is one at 25 °C or more.\n" },
  ...Array.from({ length: 12 }, (_, at) => ({ file: `projects/sea-${at}.md`, markdown: `---\ntitle: The sea, again ${at}\n---\n# Sea\n\nThe sea once more.\n` })),
]);
const run = (...words: string[]) => searchCommand.run({ site, cwd: "/", commands: [] }, words);

describe("search, at the prompt", () => {
  it("lists the pages that say every word, the best first, each with the line that says them", () => {
    expect(run("torrid", "night").text).toBe("/projects/hot-nights/  # Hot nights, counted\n  A torrid night is one at 25 °C or more.");
  });

  it("makes each a way to go there, with the words marked in its line", () => {
    const html = run("torrid", "night").html ?? "";
    expect(html).toContain('<a href="/projects/hot-nights/">/projects/hot-nights/</a>');
    expect(html).toContain("A <mark>torrid night</mark> is one at 25 °C or more.");
  });

  it("shows the first ten, and says how many more there are", () => {
    const lines = (run("sea").text ?? "").split("\n");
    expect(lines.filter((line) => line.startsWith("/"))).toHaveLength(10);
    expect(lines.at(-1)).toBe("… and 2 more. Another word narrows it.");
  });

  it("says so when no page says the words, and how it is used when it is given none", () => {
    expect(run("snow")).toEqual({ text: 'search: no page says "snow"' });
    expect(run()).toEqual({ text: "search: usage: search <words>", error: true });
  });
});
