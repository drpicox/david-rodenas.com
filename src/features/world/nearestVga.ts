
/** Below this much colour a pixel is one of the greys. */
const GREY = 0.2;
/** Above this much light a colour is the bright one of its pair, as the card had only the two. */
const BRIGHT = 0.36;

/** The six hues the card had, as the numbers of their dark and bright colours, by where they sit on the wheel. */
const FAMILIES: readonly { readonly upTo: number; readonly dark: number; readonly bright: number }[] = [
  { upTo: 20, dark: 4, bright: 12 }, // red
  { upTo: 70, dark: 6, bright: 14 }, // brown, and yellow
  { upTo: 160, dark: 2, bright: 10 }, // green
  { upTo: 198, dark: 3, bright: 11 }, // cyan — and the sea, a few degrees on, is blue
  { upTo: 275, dark: 1, bright: 9 }, // blue
  { upTo: 330, dark: 5, bright: 13 }, // magenta
  { upTo: 360, dark: 4, bright: 12 }, // red again
];

/**
 * The number of the card's colour nearest to one it does not have.
 *
 * Not the nearest in RGB: a muted green is nearer to grey than to the card's
 * green in plain distance, and a world painted that way came out in ash. What
 * the card would have shown is decided the way a converter of the time did
 * it — by hue, which picks the family, and by light, which picks the dark or
 * the bright one of the pair, with the four greys for what has no hue.
 */
export function nearestVga(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const light = (max + min) / 2 / 255;
  const colour = max === 0 ? 0 : (max - min) / max;

  if (colour < GREY) {
    if (light < 0.08) return 0;
    if (light < 0.5) return 8;
    if (light < 0.8) return 7;
    return 15;
  }

  const spread = max - min;
  let hue: number;
  if (max === r) hue = ((g - b) / spread) * 60;
  else if (max === g) hue = (2 + (b - r) / spread) * 60;
  else hue = (4 + (r - g) / spread) * 60;
  if (hue < 0) hue += 360;

  const family = FAMILIES.find(({ upTo }) => hue < upTo) ?? { dark: 4, bright: 12 };
  if (light < 0.08) return 0;
  return light >= BRIGHT ? family.bright : family.dark;
}

