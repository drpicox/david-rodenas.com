/** A colour written as `#rgb` or `#rrggbb`, as its three channels; none if it is written any other way. */
function channelsOf(colour: string): [number, number, number] | null {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(colour.trim())?.[1];
  if (!hex) return null;
  const full = hex.length === 3 ? [...hex].map((digit) => digit + digit).join("") : hex;
  return [0, 2, 4].map((at) => parseInt(full.slice(at, at + 2), 16)) as [number, number, number];
}

/**
 * The colour at a point of a ramp, 0 to 1, over stops spaced evenly along it:
 * the canvas has no colour-mix of its own, and the stops are the page's own
 * colours, read off its stylesheet. A stop that cannot be read is given whole.
 */
export function rampColour(stops: readonly string[], at: number): string {
  const along = Math.min(1, Math.max(0, at)) * Math.max(0, stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(along));
  const [from, to] = [stops[Math.max(0, index)] ?? "#000000", stops[Math.max(0, index) + 1] ?? stops[0] ?? "#000000"];
  const t = stops.length > 1 ? along - Math.max(0, index) : 0;
  const [a, b] = [channelsOf(from), channelsOf(to)];
  if (!a || !b) return t < 0.5 ? from : to;
  return `#${a.map((channel, which) => Math.round(channel + ((b[which] ?? channel) - channel) * t).toString(16).padStart(2, "0")).join("")}`;
}
