// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { aKit } from "../../blueprint/aKit";
import { openTextPanel } from "./openTextPanel";

describe("the blueprint as text, in a panel", () => {
  it("shows the text, says by line what cannot be read as it is typed, and applies it", () => {
    const host = document.createElement("div");
    const applied: string[] = [];
    openTextPanel(host, "n = nights", aKit, (text) => applied.push(text));
    const area = host.querySelector("textarea") as HTMLTextAreaElement;
    expect(area.value).toBe("n = nights");
    area.value = "n = nights\nbars tabel: n";
    area.dispatchEvent(new Event("input"));
    expect(host.querySelector(".wb-problems")?.textContent).toBe("line 2: bars takes no tabel");
    (host.querySelector(".wb-apply") as HTMLButtonElement).click();
    expect(applied).toEqual(["n = nights\nbars tabel: n"]);
    expect(host.querySelector(".wb-text")).toBeNull();
  });

  it("closes taking nothing", () => {
    const host = document.createElement("div");
    const applied: string[] = [];
    openTextPanel(host, "n = nights", aKit, (text) => applied.push(text));
    (host.querySelector(".wb-text") as HTMLElement).querySelector("textarea")?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(host.querySelector(".wb-text")).toBeNull();
    expect(applied).toEqual([]);
  });
});
