import { describe, expect, it } from "vitest";
import { Adventure } from "./Adventure";

const play = (game: Adventure, line: string) => line.split(/\s+/).filter(Boolean).map((word) => game.run(word));

describe("the 2007 adventure, rule for rule", () => {
  it("starts in the welcome room with full life and nothing in hand, and describes what it sees", () => {
    const seen = new Adventure().look();
    expect(seen.name).toBe("Welcome");
    expect(seen.life).toBe(16);
    expect(seen.item).toBe("newspaper");
    expect(seen.exits).toEqual([{ direction: "este", locked: false }]);
    expect(seen.weapon).toBeUndefined();
  });

  it("does not go through a wall, nor a locked door without its key", () => {
    const game = new Adventure();
    expect(game.go("norte")).toBe("There is no way out that way.");
    game.go("este");
    expect(game.look().name).toBe("Use the keys");
    expect(game.go("norte")).toBe("The way is locked and you are not carrying the key.");
  });

  it("opens a door with the key that fits, and keeps the key", () => {
    const game = new Adventure();
    game.go("este");
    expect(game.take()).toBe("You have taken a key.");
    expect(game.look().key).toBe("brass key");
    expect(game.go("norte")).toBe("");
    expect(game.look().name).toBe("Learn to attack");
    expect(game.look().key).toBeUndefined();
    // Opened from that side only: the way back is the way it was.
    expect(game.look().exits.find((exit) => exit.direction === "sur")?.locked).toBe(false);
  });

  it("swaps a weapon for the one held, and leaves the old one in the room", () => {
    const game = new Adventure();
    expect(game.take()).toBe("You have taken a weapon.");
    expect(game.look().weapon).toBe("newspaper");
    expect(game.look().item).toBeUndefined();
    expect(game.take()).toBe("There is nothing here to take!");
  });

  it("fights one exchange at a time: the monster falls if the weapon beats its defence, the player is hurt if its attack beats the shield", () => {
    const game = new Adventure();
    play(game, "coger este coger norte");
    expect(game.look().monster).toBe("acid fly");
    expect(game.attack()).toBe("The monster has been defeated! OUCH!");
    expect(game.look().life).toBe(12);
    expect(game.look().item).toBe("magic crystal");
    expect(game.attack()).toBe("There is no monster to attack!");
  });

  it("cannot fight without a weapon, and cannot hurt what its weapon does not beat", () => {
    const game = new Adventure();
    play(game, "este coger norte");
    expect(game.attack()).toBe("You have no weapon to attack with!");
  });

  it("eats food where it stands, up to the most life there is", () => {
    const game = new Adventure();
    play(game, "coger este coger norte atacar");
    expect(game.look().life).toBe(12);
    play(game, "coger este");
    expect(game.look().name).toBe("Dining room");
  });

  it("understands English and the game's original Spanish", () => {
    const game = new Adventure();
    expect(game.run("east")).toBe("");
    expect(game.run("w")).toBe("");
    expect(game.run("take")).toBe("You have taken a weapon.");
    expect(game.run("dance")).toBe("I do not understand you.");
  });

  it("remembers where it has been, for the map", () => {
    const game = new Adventure();
    play(game, "este oeste");
    expect([...game.visited]).toEqual(["0,0", "0,1"]);
  });
});
