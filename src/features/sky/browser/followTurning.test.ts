import { describe, expect, it } from "vitest";
import { Signal } from "../../../platform/plugin/Signal";
import type { Turn } from "../Turns";
import { followTurning } from "./followTurning";

describe("the stars, following", () => {
  it("follow whatever turns they are handed, and stop when told to", () => {
    const turns = new Signal<Turn>();
    const followed: Turn[] = [];
    const stop = followTurning({ follow: (turn) => followed.push(turn) }, turns);
    turns.send({ byRadians: 0.5, tiltedBy: 0.1, seconds: 0.02 });
    stop();
    turns.send({ byRadians: 1, tiltedBy: 0, seconds: 0.02 });
    expect(followed).toEqual([{ byRadians: 0.5, tiltedBy: 0.1, seconds: 0.02 }]);
  });
});
