import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Sprite } from "./Sprite";

const beats = (sprite: Sprite, count: number) => Array.from({ length: count }, () => (sprite.beat(), sprite.image));

describe("the picture in the egg", () => {
  it("starts on the cross, the picture of no Fibergochi at all", () => {
    expect(new Sprite().image).toBe("x0");
  });

  it("turns a series' frames at its own pace: studying slowly, a terminal fast", () => {
    const sprite = new Sprite();
    sprite.play("est");
    expect(beats(sprite, 11)).toEqual(["est1", "est1", "est1", "est1", "est1", "est2", "est2", "est2", "est2", "est2", "est3"]);
    sprite.play("http");
    expect(beats(sprite, 4)).toEqual(["http4", "http4", "http5", "http5"]);
  });

  it("names the second and third moods by their own series, normal1 and normal2", () => {
    const sprite = new Sprite();
    sprite.play("normal2");
    expect(beats(sprite, 2)).toEqual(["normal21", "normal20"]);
  });

  it("keeps its pace when told again what it is already doing", () => {
    const sprite = new Sprite();
    sprite.play("zz");
    beats(sprite, 3);
    sprite.play("zz");
    expect(beats(sprite, 3)).toEqual(["zz1", "zz1", "zz0"]);
  });

  it("shakes its head for a while, and then goes back to what it was doing", () => {
    const sprite = new Sprite();
    sprite.play("normal");
    sprite.flash("no", 3);
    expect(sprite.image).toMatch(/^no/);
    beats(sprite, 3);
    expect(sprite.image).toMatch(/^no/);
    beats(sprite, 1);
    expect(sprite.image).toMatch(/^normal\d$/);
  });

  it("remembers what it was told while shaking its head, for when it stops", () => {
    const sprite = new Sprite();
    sprite.play("normal");
    sprite.flash("no", 2);
    sprite.play("zz");
    expect(sprite.image).toMatch(/^no/);
    beats(sprite, 3);
    expect(sprite.image).toMatch(/^zz/);
  });

  it("goes back to the cross when it is all over, whatever it was doing", () => {
    const sprite = new Sprite();
    sprite.play("est");
    sprite.flash("no", 5);
    sprite.stop();
    expect(sprite.image).toBe("x0");
    sprite.beat();
    expect(sprite.image).toBe("x0");
  });

  it("shows only drawings the site serves, every one of them from 1999", () => {
    const shown = new Set<string>();
    for (const series of ["normal", "normal1", "normal2", "est", "zz", "bt", "http", "pract", "no", "bar0", "amig", "suplica"] as const) {
      const sprite = new Sprite();
      sprite.play(series);
      for (let n = 0; n < 50; n += 1) shown.add((sprite.beat(), sprite.image));
    }
    expect(new Set(Sprite.everyImage)).toEqual(new Set([...shown, "x0"]));
    const missing = [...shown, "x0"].filter((image) => !existsSync(new URL(`../../../public/fibergochi/${image}.gif`, import.meta.url)));
    expect(missing).toEqual([]);
    expect(shown.size).toBe(50);
  });
});
