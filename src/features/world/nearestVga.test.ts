import { describe, expect, it } from "vitest";
import { nearestVga } from "./nearestVga";
import { quantizeToVga } from "./quantizeToVga";
import { VGA_PALETTE } from "./vgaPalette";

describe("nearestVga", () => {
  it("knows the sixteen colours of the adapter by their number", () => {
    expect(VGA_PALETTE).toHaveLength(16);
    expect(VGA_PALETTE[0]).toBe("#000000");
    expect(VGA_PALETTE[1]).toBe("#0000aa");
    expect(VGA_PALETTE[7]).toBe("#aaaaaa");
    expect(VGA_PALETTE[15]).toBe("#ffffff");
  });

  it("gives every colour of the card back as itself", () => {
    VGA_PALETTE.forEach((hex, index) => {
      const [r, g, b] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
      expect(nearestVga(r ?? 0, g ?? 0, b ?? 0)).toBe(index);
    });
  });

  it("takes a colour the card does not have to the one it would have shown", () => {
    expect(nearestVga(20, 60, 160)).toBe(1); // a deep sea is the blue
    expect(nearestVga(90, 200, 90)).toBe(10); // grass is the bright green
    expect(nearestVga(240, 245, 250)).toBe(15); // snow is white
    expect(nearestVga(120, 80, 30)).toBe(6); // earth is the brown
  });

  it("takes a whole picture to the card's colours, and leaves the sky alone", () => {
    const pixels = new Uint8ClampedArray([20, 60, 160, 255, 90, 200, 90, 255, 9, 9, 9, 0]);
    expect([...quantizeToVga(pixels)]).toEqual([0, 0, 170, 255, 85, 255, 85, 255, 9, 9, 9, 0]);
  });
});
