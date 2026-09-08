import { describe, expect, it } from "vitest";
import { Signal } from "./Signal";

describe("Signal", () => {
  it("tells everyone listening, in the order they arrived", () => {
    const signal = new Signal<number>();
    const heard: string[] = [];
    signal.on((n) => heard.push(`first ${n}`));
    signal.on((n) => heard.push(`second ${n}`));
    signal.send(7);
    expect(heard).toEqual(["first 7", "second 7"]);
  });

  it("says nothing when nobody is listening, which is the point", () => {
    expect(() => new Signal<number>().send(1)).not.toThrow();
  });

  it("stops telling whoever stopped listening", () => {
    const signal = new Signal<number>();
    const heard: number[] = [];
    const stop = signal.on((n) => heard.push(n));
    signal.send(1);
    stop();
    signal.send(2);
    expect(heard).toEqual([1]);
  });

  // A listener that leaves during a send must not make the send skip the next one.
  it("finishes telling everyone even if one of them leaves halfway", () => {
    const signal = new Signal<number>();
    const heard: string[] = [];
    const stop = signal.on(() => stop());
    signal.on((n) => heard.push(`still here ${n}`));
    signal.send(1);
    expect(heard).toEqual(["still here 1"]);
  });
});
