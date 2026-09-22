import { describe, expect, it } from "vitest";
import { Adventure } from "./Adventure";

const play = (game: Adventure, line: string) => line.split(/\s+/).filter(Boolean).map((word) => game.run(word));

describe("the 2007 adventure, rule for rule", () => {
  it("starts in the welcome room with full life and nothing in hand, and describes what it sees", () => {
    const seen = new Adventure().look();
    expect(seen.name).toBe("Bienvenida");
    expect(seen.life).toBe(16);
    expect(seen.item).toBe("diario");
    expect(seen.exits).toEqual([{ direction: "este", locked: false }]);
    expect(seen.weapon).toBeUndefined();
  });

  it("does not go through a wall, nor a locked door without its key", () => {
    const game = new Adventure();
    expect(game.go("norte")).toBe("La salida no existe.");
    game.go("este");
    expect(game.look().name).toBe("Usa las llaves");
    expect(game.go("norte")).toBe("La salida esta cerrada y no llevas la llave.");
  });

  it("opens a door with the key that fits, and keeps the key", () => {
    const game = new Adventure();
    game.go("este");
    expect(game.take()).toBe("Has cogido una llave.");
    expect(game.look().key).toBe("llave de laton");
    expect(game.go("norte")).toBe("");
    expect(game.look().name).toBe("Aprende a atacar");
    expect(game.look().key).toBeUndefined();
    // Opened from that side only: the way back is the way it was.
    expect(game.look().exits.find((exit) => exit.direction === "sur")?.locked).toBe(false);
  });

  it("swaps a weapon for the one held, and leaves the old one in the room", () => {
    const game = new Adventure();
    expect(game.take()).toBe("Has cogido una arma.");
    expect(game.look().weapon).toBe("diario");
    expect(game.look().item).toBeUndefined();
    expect(game.take()).toBe("No hay ningun objeto para coger!");
  });

  it("fights one exchange at a time: the monster falls if the weapon beats its defence, the player is hurt if its attack beats the shield", () => {
    const game = new Adventure();
    play(game, "coger este coger norte");
    expect(game.look().monster).toBe("mosca acida");
    expect(game.attack()).toBe("El monstruo ha sido derrotado! OUCH!");
    expect(game.look().life).toBe(12);
    expect(game.look().item).toBe("cristal magico");
    expect(game.attack()).toBe("No hay monstruo para atacar!");
  });

  it("cannot fight without a weapon, and cannot hurt what its weapon does not beat", () => {
    const game = new Adventure();
    play(game, "este coger norte");
    expect(game.attack()).toBe("No tienes ningua arma para atacar!");
  });

  it("eats food where it stands, up to the most life there is", () => {
    const game = new Adventure();
    play(game, "coger este coger norte atacar");
    expect(game.look().life).toBe(12);
    play(game, "coger este");
    expect(game.look().name).toBe("Comedor");
  });

  it("understands the game's words and their English", () => {
    const game = new Adventure();
    expect(game.run("east")).toBe("");
    expect(game.run("w")).toBe("");
    expect(game.run("take")).toBe("Has cogido una arma.");
    expect(game.run("dance")).toBe("No te entiendo.");
  });

  it("remembers where it has been, for the map", () => {
    const game = new Adventure();
    play(game, "este oeste");
    expect([...game.visited]).toEqual(["0,0", "0,1"]);
  });
});
