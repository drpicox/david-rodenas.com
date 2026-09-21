type Rgb = readonly [number, number, number];

/**
 * The scale of the analysis this page comes from, kept because it answers the
 * question a reader actually has — is this good or bad? — before a number is
 * read. It is hung on the European annual limit: green at nothing, yellow
 * halfway to the limit, red at it, purple at one and a half times, and nearly
 * black from twice it on. The colours mean the same in either theme, so they
 * are written here and not mixed from the page's own.
 */
const STOPS: readonly (readonly [number, Rgb])[] = [
  [0, [0, 255, 0]],
  [20, [225, 225, 0]],
  [40, [255, 0, 0]],
  [60, [225, 0, 225]],
  [80, [64, 0, 64]],
  [230, [16, 0, 8]],
];

export interface No2Colour {
  readonly background: string;
  /** The background is dark enough that what is written on it has to be light. */
  readonly light: boolean;
}

/** How bright a colour looks, 0 to 1: green weighs most, blue least. */
const brightness = ([red, green, blue]: Rgb) => (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

export function no2Colour(value: number): No2Colour {
  const clamped = Math.max(0, Math.min(value, 230));
  const upper = Math.max(1, STOPS.findIndex(([at]) => at >= clamped));
  const [from, low] = STOPS[upper - 1] ?? STOPS[0]!;
  const [to, high] = STOPS[upper] ?? STOPS[STOPS.length - 1]!;
  const along = (clamped - from) / (to - from);
  const mixed = low.map((channel, index) => Math.round(channel + ((high[index] ?? 0) - channel) * along)) as unknown as Rgb;
  return { background: `rgb(${mixed.join(",")})`, light: brightness(mixed) < 0.45 };
}
