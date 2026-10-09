import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import type { Flag } from "./Flag";
import { flagsCommand } from "./flagsCommand";
import type { FlagStore } from "./FlagStore";

const context = { site: new Site([{ file: "index.md", markdown: "---\ntitle: Home\n---\n" }]), cwd: "/", commands: [] };
const FLAGS: Flag[] = [
  { name: "portfolio", description: "lists with pictures as cards" },
  { name: "loud", description: "everything in capitals" },
];
const SEARCH: Flag = { name: "search", description: "how the site is searched", choices: ["prompt", "header", "palette"] };

function aStore(...on: string[]): FlagStore {
  const kept = new Set(on);
  const turn = (name: string, value: boolean) => void (value ? kept.add(name) : kept.delete(name));
  return { isOn: (name) => kept.has(name), set: turn, chosen: () => false, drawn: () => undefined, draw: turn };
}

const run = (store: FlagStore, ...args: string[]) => flagsCommand(FLAGS, store).run(context, args);

describe("the flags command", () => {
  it("lists every flag, each with its two choices, the one it is at marked, and what it does", () => {
    expect(run(aStore("loud")).text).toBe(["portfolio   on [off]  lists with pictures as cards", "loud       [on] off   everything in capitals"].join("\n"));
  });

  it("makes each other choice something to click, which runs the command its title names", () => {
    const html = run(aStore()).html ?? "";
    expect(html).toContain('<a href="#" data-run="flags portfolio on" title="flags portfolio on">on</a>');
    expect(html).toContain('<strong aria-current="true">off</strong>');
  });

  it("lays the markup out as a list that folds on a narrow screen, the switch apart from the words that say what it does", () => {
    const html = run(aStore()).html ?? "";
    expect(html).toMatch(/^<dl class="help flags"><dt>portfolio <span class="switch">/);
    expect(html).toContain("<dd>lists with pictures as cards</dd>");
  });

  it("turns one on or off, and lists them all again", () => {
    const store = aStore();
    expect(run(store, "portfolio", "on").text).toContain("portfolio  [on] off   lists with pictures as cards");
    expect(store.isOn("portfolio")).toBe(true);
    run(store, "portfolio", "off");
    expect(store.isOn("portfolio")).toBe(false);
  });

  it("toggles one named without a choice", () => {
    const store = aStore("portfolio");
    run(store, "portfolio");
    expect(store.isOn("portfolio")).toBe(false);
  });

  it("refuses a flag there is not, and a choice that is neither", () => {
    expect(run(aStore(), "colour")).toEqual({ text: "flags: colour: no such flag. Try flags", error: true });
    expect(run(aStore(), "loud", "maybe")).toEqual({ text: "flags: loud: choose on or off", error: true });
  });

  it("lists a flag with choices with each of them and off, the one it is at marked", () => {
    expect(flagsCommand([SEARCH], aStore("search=header")).run(context, []).text).toBe("search   prompt [header] palette  off   how the site is searched");
    expect(flagsCommand([SEARCH], aStore()).run(context, []).html).toContain('<a href="#" data-run="flags search palette" title="flags search palette">palette</a>');
  });

  it("switches a flag with choices to one of them and every other off, or all of them off", () => {
    const store = aStore("search=prompt");
    const chosen = () => SEARCH.choices!.filter((choice) => store.isOn(`search=${choice}`));
    flagsCommand([SEARCH], store).run(context, ["search", "palette"]);
    expect(chosen()).toEqual(["palette"]);
    flagsCommand([SEARCH], store).run(context, ["search", "off"]);
    expect(chosen()).toEqual([]);
  });

  it("turns a flag with choices named alone to its first choice, and off again", () => {
    const store = aStore();
    flagsCommand([SEARCH], store).run(context, ["search"]);
    expect(store.isOn("search=prompt")).toBe(true);
    flagsCommand([SEARCH], store).run(context, ["search"]);
    expect(store.isOn("search=prompt")).toBe(false);
  });

  it("refuses a choice a flag with choices has not, naming the ones it has", () => {
    expect(flagsCommand([SEARCH], aStore()).run(context, ["search", "on"])).toEqual({ text: "flags: search: choose prompt, header, palette or off", error: true });
  });

  it("says so when there are none", () => {
    expect(flagsCommand([], aStore()).run(context, []).text).toBe("No flags to try just now.");
  });
});
