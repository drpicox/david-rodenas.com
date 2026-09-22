import { describe, expect, it } from "vitest";
import { items, monsters, rooms } from "./englishWorld";
import { rooms as spanish } from "./originalWorld";

describe("the world in English", () => {
  it("names everything, and every room's contents still name an item or a monster", () => {
    const names = new Set([...items.map((one) => one.name), ...monsters.map((one) => one.name), "nada"]);
    const unnamed = Object.values(rooms).filter((room) => !names.has(room.holds));
    expect(unnamed).toEqual([]);
    expect(monsters.filter((monster) => !items.some((item) => item.name === monster.drops))).toEqual([]);
  });

  it("leaves no Spanish behind", () => {
    const words = /\b(el|la|los|las|de|que|una?|y|es|del|al|con)\b/i;
    const spanishText = Object.entries(rooms).filter(([, room]) => words.test(room.text) || words.test(room.name));
    expect(spanishText.map(([where]) => where)).toEqual([]);
    expect([...items, ...monsters].filter((one) => /[áéíóúñ]|llave|espada|escudo/i.test(one.name))).toEqual([]);
  });

  it("changes nothing but the words: the map, the exits and the numbers are the original's", () => {
    for (const [where, room] of Object.entries(rooms)) expect(room.exits).toEqual(spanish[where]?.exits);
    expect(Object.keys(rooms)).toHaveLength(64);
  });
});
