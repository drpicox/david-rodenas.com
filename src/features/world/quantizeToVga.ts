import { nearestVga } from "./nearestVga";
import { VGA_PALETTE } from "./vgaPalette";

const CHANNELS = VGA_PALETTE.map((hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)));

/** Every painted pixel of an RGBA buffer taken to the card's nearest colour, in place. Sky stays sky. */
export function quantizeToVga(pixels: Uint8ClampedArray): Uint8ClampedArray {
  for (let at = 0; at < pixels.length; at += 4) {
    if ((pixels[at + 3] ?? 0) === 0) continue;
    const [r = 0, g = 0, b = 0] = CHANNELS[nearestVga(pixels[at] ?? 0, pixels[at + 1] ?? 0, pixels[at + 2] ?? 0)] ?? [];
    pixels[at] = r;
    pixels[at + 1] = g;
    pixels[at + 2] = b;
  }
  return pixels;
}
